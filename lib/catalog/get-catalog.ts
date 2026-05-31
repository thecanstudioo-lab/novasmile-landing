import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";
import { TENANT_SUBDOMINIO, TENANT_ID_FALLBACK } from "@/lib/config";
import type { Servicio, Especialista, Sede, Tenant, IconoKey } from "@/lib/catalog/types";

const ICONOS_VALIDOS: IconoKey[] = [
  "Sparkle", "Tooth", "Smiley", "Crown", "Sun", "Wrench",
  "PaintBrush", "MagnifyingGlass", "Baby", "Scissors", "Cube", "Atom",
];

function normalizarIcono(value: unknown): IconoKey {
  return ICONOS_VALIDOS.includes(value as IconoKey) ? (value as IconoKey) : "Tooth";
}

/** Resuelve el tenant servido por esta landing. */
export async function getTenant(): Promise<Tenant> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("tenants")
      .select("id, nombre, subdominio")
      .eq("subdominio", TENANT_SUBDOMINIO)
      .eq("activo", true)
      .maybeSingle();

    if (data) return data as Tenant;
  } catch {
    /* cae al fallback */
  }
  return { id: TENANT_ID_FALLBACK, nombre: "NovaSmile Elite", subdominio: TENANT_SUBDOMINIO };
}

/** Catalogo de servicios activos del tenant, ordenado. Leido por anon key. */
export async function getServicios(tenantId: string): Promise<Servicio[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("servicios")
    .select("id, slug, titulo, resumen, categoria, icono, destacado, orden")
    .eq("tenant_id", tenantId)
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id as string,
    slug: s.slug as string,
    titulo: s.titulo as string,
    resumen: s.resumen as string,
    categoria: (s.categoria as string | null) ?? null,
    icono: normalizarIcono(s.icono),
    destacado: Boolean(s.destacado),
    orden: Number(s.orden ?? 0),
  }));
}

/** Especialistas activos del tenant. Leido por anon key. */
export async function getEspecialistas(tenantId: string): Promise<Especialista[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("especialistas")
    .select("id, nombre, titulo, especialidad, sede_id, orden")
    .eq("tenant_id", tenantId)
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error || !data) return [];

  return data.map((e) => ({
    id: e.id as string,
    nombre: e.nombre as string,
    titulo: (e.titulo as string | null) ?? null,
    especialidad: (e.especialidad as string | null) ?? null,
    sedeId: (e.sede_id as string | null) ?? null,
  }));
}

/** Sedes activas del tenant. Leido por anon key. */
export async function getSedes(tenantId: string): Promise<Sede[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sedes")
    .select("id, nombre, direccion, ciudad, telefono")
    .eq("tenant_id", tenantId)
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id as string,
    nombre: s.nombre as string,
    direccion: (s.direccion as string | null) ?? null,
    ciudad: (s.ciudad as string | null) ?? null,
    telefono: (s.telefono as string | null) ?? null,
  }));
}
