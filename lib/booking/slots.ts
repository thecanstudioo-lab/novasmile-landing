import { TZ, TZ_OFFSET } from "@/lib/config";

// Helpers puros (sin dependencias de servidor) para construir la grilla de horarios.
// La verdad sobre solapamientos la arbitra Postgres (constraint EXCLUDE en `citas`):
// si un slot ya esta tomado, book-appointment responde 409 y lo mostramos como conflicto.

const HORA_INICIO = 8; // 8:00
const HORA_FIN = 17; // ultimo slot empieza 16:00, termina 17:00
const DURACION_MIN = 60;

/** Devuelve los proximos `n` dias habiles (excluye domingos). */
export function proximosDias(n: number): Date[] {
  const dias: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1); // desde manana

  while (dias.length < n) {
    if (cursor.getDay() !== 0) {
      dias.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

/** Etiqueta legible de una fecha en es-CO. */
export function fechaLegible(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(fecha);
}

/** Etiqueta corta (dia + numero) para los chips de seleccion de dia. */
export function fechaCorta(fecha: Date): { dia: string; num: string; mes: string } {
  const dia = new Intl.DateTimeFormat("es-CO", { weekday: "short", timeZone: TZ }).format(fecha);
  const num = new Intl.DateTimeFormat("es-CO", { day: "numeric", timeZone: TZ }).format(fecha);
  const mes = new Intl.DateTimeFormat("es-CO", { month: "short", timeZone: TZ }).format(fecha);
  return { dia: dia.replace(".", ""), num, mes: mes.replace(".", "") };
}

export type Slot = { label: string; inicioISO: string; finISO: string };

/** Construye los slots de 1h para una fecha dada, con offset de Bogota. */
export function slotsParaFecha(fecha: Date): Slot[] {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");

  const slots: Slot[] = [];
  for (let h = HORA_INICIO; h < HORA_FIN; h++) {
    const hh = String(h).padStart(2, "0");
    const hhFin = String(h + Math.floor(DURACION_MIN / 60)).padStart(2, "0");
    const inicioISO = `${y}-${m}-${d}T${hh}:00:00${TZ_OFFSET}`;
    const finISO = `${y}-${m}-${d}T${hhFin}:00:00${TZ_OFFSET}`;
    const label = h <= 11 ? `${h}:00 a.m.` : h === 12 ? "12:00 p.m." : `${h - 12}:00 p.m.`;
    slots.push({ label, inicioISO, finISO });
  }
  return slots;
}

/** Texto legible de un slot ISO (para el resumen). */
export function slotLegible(inicioISO: string): string {
  const fecha = new Date(inicioISO);
  const dia = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(fecha);
  const hora = new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  }).format(fecha);
  return `${dia}, ${hora}`;
}
