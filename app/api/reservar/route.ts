// app/api/reservar/route.ts
//
// OPCIÓN A — La reserva NO inserta directo en `citas`.
// Firma el payload con HMAC-SHA256 y lo delega a la Edge Function `book-appointment`,
// que es el guardián: valida firma, resuelve tenant, hace el INSERT atómico con
// anti-doble-reserva (constraint EXCLUDE → 409) y dispara el fan-out FIRMADO a Zapier
// (bloques calendar/gmail/whatsapp/tecnico). El frontend nunca escribe en la DB.
//
// Requiere estas variables de entorno en Vercel (Project → Settings → Environment Variables):
//   NEXT_PUBLIC_SUPABASE_URL        -> https://khuewkknabdpqaiubjam.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY   -> (anon key pública; para atravesar el gateway /functions/v1/)
//   BOOKING_WEBHOOK_SECRET          -> SECRETO de servidor (NO NEXT_PUBLIC). DEBE ser byte-idéntico
//                                      al `BOOKING_WEBHOOK_SECRET` del panel de Edge Functions de Supabase.
// Opcional:
//   NEXT_PUBLIC_TENANT_HINT         -> subdominio del tenant (por defecto "novasmile")

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // WebCrypto global está disponible en Node 18+; forzamos node para evitar sorpresas

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
// .trim() defensivo: el error #1 de HMAC es un \n o espacio final al pegar el secreto.
const BOOKING_SECRET = (process.env.BOOKING_WEBHOOK_SECRET ?? "").trim();
const TENANT_HINT = (process.env.NEXT_PUBLIC_TENANT_HINT ?? "novasmile").toLowerCase();

const BOOK_ENDPOINT = `${SUPABASE_URL}/functions/v1/book-appointment`;

/** HMAC-SHA256 → hex, idéntico a la implementación de la Edge Function (WebCrypto + TextEncoder). */
async function hmacHex(secret: string, raw: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type ReservaInput = {
  paciente_nombre?: string;
  paciente_email?: string;
  paciente_telefono?: string;
  servicio?: string;
  especialista?: string;
  especialista_id?: string;
  sede_id?: string;
  inicio?: string; // ISO 8601, ej "2026-06-03T09:00:00-05:00"
  fin?: string;    // opcional; la Edge Function asume 60 min si falta
  notas?: string;
};

export async function POST(req: NextRequest) {
  // 0) Config sanity (no filtramos detalles al cliente)
  if (!SUPABASE_URL || !ANON_KEY || !BOOKING_SECRET) {
    console.error("[reservar] Falta configuración de entorno (URL/ANON/BOOKING_WEBHOOK_SECRET).");
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  // 1) Parseo + validación mínima de entrada del formulario
  let input: ReservaInput;
  try {
    input = (await req.json()) as ReservaInput;
  } catch {
    return NextResponse.json({ ok: false, error: "json_invalido" }, { status: 400 });
  }

  const faltantes: string[] = [];
  if (!input.paciente_nombre?.trim()) faltantes.push("paciente_nombre");
  if (!input.servicio?.trim()) faltantes.push("servicio");
  if (!input.especialista?.trim() && !input.especialista_id?.trim()) faltantes.push("especialista");
  if (!input.inicio?.trim() || Number.isNaN(Date.parse(input.inicio))) faltantes.push("inicio");
  if (faltantes.length) {
    return NextResponse.json({ ok: false, error: "campos_invalidos", faltantes }, { status: 400 });
  }

  // 2) Construcción del payload con el contrato EXACTO de book-appointment v11
  const payload = {
    meta: {
      event_id: crypto.randomUUID(),        // idempotencia / dedup
      event_type: "appointment.requested",
      source: "web_booking",
      occurred_at: new Date().toISOString(), // anti-replay ±5 min
      tenant_hint: TENANT_HINT,              // OBLIGATORIO (la función responde 403 sin esto)
    },
    cita: {
      paciente_nombre: input.paciente_nombre!.trim(),
      paciente_email: input.paciente_email?.trim() || null,
      paciente_telefono: input.paciente_telefono?.trim() || null,
      servicio: input.servicio!.trim(),
      // la función acepta cualquiera de los dos; preferimos especialista_id si vino
      especialista_id: input.especialista_id?.trim() || undefined,
      especialista: input.especialista?.trim() || undefined,
      sede_id: input.sede_id?.trim() || undefined,
      inicio: new Date(input.inicio!).toISOString(),
      fin: input.fin && !Number.isNaN(Date.parse(input.fin))
        ? new Date(input.fin).toISOString()
        : undefined,
      notas: input.notas?.trim() || undefined,
    },
  };

  // CRÍTICO: se firma EXACTAMENTE el string que se envía. No volver a serializar después de firmar.
  const raw = JSON.stringify(payload);
  const signature = "sha256=" + (await hmacHex(BOOKING_SECRET, raw));

  // 3) Llamada firmada a la Edge Function (guardián)
  let upstream: Response;
  try {
    upstream = await fetch(BOOK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-can-signature": signature,
        // El gateway /functions/v1/ espera apikey + Authorization (patrón verificado del stack)
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: raw,
      // evita que una Edge Function lenta cuelgue el route
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.error("[reservar] fallo de red hacia book-appointment:", e);
    return NextResponse.json({ ok: false, error: "upstream_inalcanzable" }, { status: 502 });
  }

  let data: any = null;
  try {
    data = await upstream.json();
  } catch {
    /* respuesta sin cuerpo JSON */
  }

  // 4) Traducción de códigos de la Edge Function → respuesta para el frontend
  if (upstream.ok) {
    // 200/201: cita creada en estado pendiente_sync; book-appointment ya disparó el fan-out a Zapier
    return NextResponse.json(
      { ok: true, cita_id: data?.cita_id ?? null, estado: data?.estado ?? "pendiente_sync" },
      { status: 200 },
    );
  }

  if (upstream.status === 409) {
    // Slot ocupado: devolvemos los huecos ocupados para que el funnel sugiera alternos
    return NextResponse.json(
      { ok: false, error: "slot_ocupado", franja_solicitada: data?.franja_solicitada, ocupados: data?.ocupados ?? [] },
      { status: 409 },
    );
  }

  if (upstream.status === 422 || upstream.status === 403) {
    // Problemas con los datos enviados (validación / tenant)
    return NextResponse.json({ ok: false, error: data?.error ?? "datos_invalidos" }, { status: 400 });
  }

  // 401 (firma) / 500 / otros: problema interno; no exponemos el detalle al navegador
  console.error("[reservar] book-appointment devolvió", upstream.status, data);
  return NextResponse.json({ ok: false, error: "no_se_pudo_registrar" }, { status: 502 });
}