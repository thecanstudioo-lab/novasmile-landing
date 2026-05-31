"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  CheckCircle,
  CircleNotch,
  CaretRight,
  CaretLeft,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import type { Servicio, Especialista, Sede } from "@/lib/catalog/types";
import { slotsParaFecha, slotLegible, type Slot } from "@/lib/booking/slots";
import { Calendar } from "./calendar"; // <- coloca Calenadar.tsx en la MISMA carpeta que este archivo

type Datos = { nombre: string; telefono: string; email: string; notas: string; consentimiento: boolean };

// Respuesta REAL de /api/reservar (route.ts) — no el tipo viejo con `code`.
type ApiResp = {
  ok?: boolean;
  cita_id?: string;
  estado?: string;
  error?: string;
  faltantes?: string[];
  mensaje?: string;
  ocupados?: { fecha_cita: string; fecha_fin: string }[];
};
type Feedback = { tipo: "error" | "conflicto"; mensaje: string; campos?: string[] } | null;

export function ReservaSection({
  servicios,
  especialistas,
  sedes,
}: {
  servicios: Servicio[];
  especialistas: Especialista[];
  sedes: Sede[];
}) {
  const reduce = useReducedMotion();

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [servicioSlug, setServicioSlug] = useState("");
  const [especialistaId, setEspecialistaId] = useState("");
  const [sedeId, setSedeId] = useState(sedes[0]?.id ?? "");
  const [fecha, setFecha] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [datos, setDatos] = useState<Datos>({ nombre: "", telefono: "", email: "", notas: "", consentimiento: false });
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [exito, setExito] = useState(false);

  // Preseleccion desde la seccion de servicios.
  useEffect(() => {
    function onSelect(e: Event) {
      const slug = (e as CustomEvent<string>).detail;
      if (servicios.some((s) => s.slug === slug)) {
        setServicioSlug(slug);
        setPaso(1);
        setExito(false);
        setFeedback(null);
      }
    }
    window.addEventListener("novasmile:select-servicio", onSelect);
    return () => window.removeEventListener("novasmile:select-servicio", onSelect);
  }, [servicios]);

  const servicioSel = servicios.find((s) => s.slug === servicioSlug) ?? null;
  const especialistaSel = especialistas.find((e) => e.id === especialistaId) ?? null;
  const sedeSel = sedes.find((s) => s.id === sedeId) ?? null;
  const slots = useMemo<Slot[]>(() => (fecha ? slotsParaFecha(fecha) : []), [fecha]);

  const puedePaso1 = Boolean(servicioSlug && sedeId);
  const puedePaso2 = Boolean(slot);

  function reiniciar() {
    setPaso(1);
    setServicioSlug("");
    setEspecialistaId("");
    setSedeId(sedes[0]?.id ?? "");
    setFecha(null);
    setSlot(null);
    setDatos({ nombre: "", telefono: "", email: "", notas: "", consentimiento: false });
    setFeedback(null);
    setExito(false);
  }

  async function enviar() {
    if (enviando) return;

    // Validacion en cliente (evita ida/vuelta y resalta campos)
    const faltan: string[] = [];
    if (!datos.nombre.trim()) faltan.push("paciente_nombre");
    if (!datos.telefono.trim()) faltan.push("paciente_telefono");
    if (!datos.consentimiento) faltan.push("consentimiento");
    if (faltan.length) {
      setFeedback({ tipo: "error", mensaje: "Completa los campos obligatorios.", campos: faltan });
      return;
    }

    setEnviando(true);
    setFeedback(null);

    const payload = {
      paciente_nombre: datos.nombre,
      paciente_email: datos.email || null,
      paciente_telefono: datos.telefono,
      servicio: servicioSlug,
      especialista_id: especialistaId || undefined,
      sede_id: sedeId,
      inicio: slot!.inicioISO,
      fin: slot!.finISO,
      notas: datos.notas || undefined,
    };

    try {
      const resp = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await resp.json().catch(() => ({}))) as ApiResp;

      if (resp.ok && json.ok !== false) {
        setExito(true);
        return;
      }
      if (resp.status === 409) {
        setFeedback({ tipo: "conflicto", mensaje: "Ese horario ya no esta disponible. Elige otro." });
        setSlot(null);
        setPaso(2);
        return;
      }
      if (resp.status === 400) {
        setFeedback({
          tipo: "error",
          mensaje: json.faltantes?.length ? "Revisa los campos marcados." : (json.mensaje ?? "Revisa los datos e intenta de nuevo."),
          campos: json.faltantes,
        });
        return;
      }
      setFeedback({ tipo: "error", mensaje: "No pudimos registrar tu cita. Intenta de nuevo en un momento." });
    } catch {
      setFeedback({ tipo: "error", mensaje: "Sin conexion con el servidor. Reintenta." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="reservar" className="bg-aurora-navy grain relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-paper sm:text-5xl">
            Agenda tu valoracion
          </h2>
          <p className="mt-4 text-base text-paper/60">Tres pasos. Te confirmamos por WhatsApp y correo.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          {/* Panel principal */}
          <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-lift)] sm:p-9">
            <AnimatePresence mode="wait">
              {exito ? (
                <Exito key="exito" onNueva={reiniciar} />
              ) : (
                <motion.div
                  key={`paso-${paso}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Progreso paso={paso} />

                  {paso === 1 && (
                    <PasoServicio
                      servicios={servicios}
                      especialistas={especialistas}
                      sedes={sedes}
                      servicioSlug={servicioSlug}
                      especialistaId={especialistaId}
                      sedeId={sedeId}
                      onServicio={setServicioSlug}
                      onEspecialista={setEspecialistaId}
                      onSede={setSedeId}
                    />
                  )}

                  {paso === 2 && (
                    <div className="space-y-6">
                      <h3 className="font-display text-xl font-bold text-ink">Elige fecha y hora</h3>
                      <div className="rounded-[var(--radius-card)] border border-line p-3 sm:p-4">
                        <Calendar value={fecha} onChange={(d) => { setFecha(d); setSlot(null); }} />
                      </div>
                      {fecha && (
                        <div>
                          <div className="mb-2.5 text-sm font-semibold capitalize text-ink">
                            {fecha.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {slots.length === 0 && (
                              <p className="col-span-full text-sm text-slate">No hay horarios para este dia.</p>
                            )}
                            {slots.map((s) => {
                              const activo = slot?.inicioISO === s.inicioISO;
                              return (
                                <button
                                  key={s.inicioISO}
                                  type="button"
                                  onClick={() => setSlot(s)}
                                  className={`min-h-[44px] rounded-[var(--radius-field)] border text-sm font-medium transition-[background-color,color,border-color] ${activo
                                      ? "border-ink bg-ink text-paper"
                                      : "border-line bg-white text-ink hover:border-ink/40"
                                    }`}
                                >
                                  {s.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-slate">Atencion: lunes a sabado, 8:00 a.m. a 5:00 p.m.</p>
                    </div>
                  )}

                  {paso === 3 && (
                    <PasoDatos datos={datos} onCambio={(d) => setDatos({ ...datos, ...d })} campos={feedback?.campos} />
                  )}

                  {/* Banner global (conflicto o error no ligado a campo) — monocromo */}
                  {feedback && (feedback.tipo === "conflicto" || !feedback.campos?.length) && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-[var(--radius-field)] border-l-2 border-ink bg-silver px-4 py-3 text-sm text-ink">
                      <WarningCircle weight="fill" className="mt-0.5 shrink-0" />
                      <span>{feedback.mensaje}</span>
                    </div>
                  )}

                  {/* Navegacion */}
                  <div className="mt-8 flex items-center justify-between gap-3">
                    {paso > 1 ? (
                      <button
                        onClick={() => setPaso((p) => (p - 1) as 1 | 2)}
                        className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-4 py-3 text-sm font-medium text-slate transition-colors hover:bg-silver active:scale-95"
                      >
                        <CaretLeft weight="bold" /> Atras
                      </button>
                    ) : (
                      <span />
                    )}

                    {paso < 3 ? (
                      <button
                        onClick={() => setPaso((p) => (p + 1) as 2 | 3)}
                        disabled={(paso === 1 && !puedePaso1) || (paso === 2 && !puedePaso2)}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Continuar <CaretRight weight="bold" />
                      </button>
                    ) : (
                      <button
                        onClick={enviar}
                        disabled={enviando}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                        {enviando ? (
                          <><CircleNotch weight="bold" className="animate-spin" /> Enviando...</>
                        ) : (
                          <>Confirmar reserva</>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rail de resumen (desktop) */}
          <aside className="glass-dark hidden rounded-[var(--radius-card)] p-6 text-paper lg:block">
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-paper/50">Tu reserva</h3>
            <div className="mt-5 space-y-4">
              <ResumenFila etiqueta="Tratamiento" valor={servicioSel?.titulo ?? "Por elegir"} />
              <ResumenFila etiqueta="Especialista" valor={especialistaSel?.nombre ?? "Sin preferencia"} />
              <ResumenFila etiqueta="Sede" valor={sedeSel?.nombre ?? "Por elegir"} />
              <ResumenFila etiqueta="Fecha y hora" valor={slot ? slotLegible(slot.inicioISO) : "Por elegir"} />
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-paper/50">
              Al confirmar, tu cita queda registrada y recibiras la confirmacion por los canales que dejes.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Subcomponentes ----------------------------- */

function Progreso({ paso }: { paso: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "Tratamiento" },
    { n: 2, label: "Fecha" },
    { n: 3, label: "Tus datos" },
  ];
  return (
    <div className="mb-8 flex items-center gap-2">
      {items.map((it, i) => (
        <div key={it.n} className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${paso >= it.n ? "bg-ink text-paper" : "bg-silver text-slate"
              }`}
          >
            {it.n}
          </div>
          <span className={`hidden text-xs font-medium sm:inline ${paso >= it.n ? "text-ink" : "text-slate"}`}>
            {it.label}
          </span>
          {i < items.length - 1 && <div className={`h-px flex-1 ${paso > it.n ? "bg-ink" : "bg-line"}`} />}
        </div>
      ))}
    </div>
  );
}

function PasoServicio({
  servicios, especialistas, sedes, servicioSlug, especialistaId, sedeId, onServicio, onEspecialista, onSede,
}: {
  servicios: Servicio[];
  especialistas: Especialista[];
  sedes: Sede[];
  servicioSlug: string;
  especialistaId: string;
  sedeId: string;
  onServicio: (v: string) => void;
  onEspecialista: (v: string) => void;
  onSede: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-ink">Que te gustaria mejorar?</h3>

      <Campo label="Tratamiento" requerido>
        <select className="field" value={servicioSlug} onChange={(e) => onServicio(e.target.value)}>
          <option value="">Selecciona un tratamiento</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.slug}>{s.titulo}</option>
          ))}
        </select>
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Especialista" ayuda="Opcional. Si no eliges, asignamos al mejor disponible.">
          <select className="field" value={especialistaId} onChange={(e) => onEspecialista(e.target.value)}>
            <option value="">Sin preferencia</option>
            {especialistas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}{e.especialidad ? ` - ${e.especialidad}` : ""}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Sede" requerido>
          <select className="field" value={sedeId} onChange={(e) => onSede(e.target.value)}>
            {sedes.length === 0 && <option value="">No hay sedes configuradas</option>}
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </Campo>
      </div>
    </div>
  );
}

function PasoDatos({
  datos, onCambio, campos,
}: {
  datos: Datos;
  onCambio: (d: Partial<Datos>) => void;
  campos?: string[];
}) {
  const has = (k: string) => campos?.includes(k);
  return (
    <div className="space-y-4">
      <h3 className="font-display flex items-center gap-2 text-xl font-bold text-ink">
        <User weight="duotone" /> Tus datos de contacto
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Nombre completo" requerido error={has("paciente_nombre") ? "Requerido" : undefined}>
          <input className="field" value={datos.nombre} onChange={(e) => onCambio({ nombre: e.target.value })} placeholder="Maria Fernanda Gomez" autoComplete="name" />
        </Campo>
        <Campo label="WhatsApp" requerido error={has("paciente_telefono") ? "Requerido" : undefined}>
          <input className="field" value={datos.telefono} onChange={(e) => onCambio({ telefono: e.target.value })} placeholder="300 111 2233" inputMode="tel" autoComplete="tel" />
        </Campo>
      </div>

      <Campo label="Correo electronico" ayuda="Opcional. Te enviamos la confirmacion aqui.">
        <input className="field" value={datos.email} onChange={(e) => onCambio({ email: e.target.value })} placeholder="tucorreo@ejemplo.com" inputMode="email" autoComplete="email" />
      </Campo>

      <Campo label="Mensaje" ayuda="Opcional. Cuentanos que buscas.">
        <textarea className="field min-h-[80px] resize-none" value={datos.notas} onChange={(e) => onCambio({ notas: e.target.value })} placeholder="Quiero una valoracion para diseno de sonrisa." />
      </Campo>

      <label className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-field)] p-3 text-sm text-slate transition-colors ${has("consentimiento") ? "bg-silver ring-1 ring-ink" : "bg-silver"}`}>
        <input
          type="checkbox"
          checked={datos.consentimiento}
          onChange={(e) => onCambio({ consentimiento: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[color:var(--color-ink)]"
        />
        <span>Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 (Habeas Data) para gestionar mi cita.</span>
      </label>
      {has("consentimiento") && <p className="text-sm font-medium text-ink">Debes autorizar el tratamiento de datos para continuar.</p>}
    </div>
  );
}

function Campo({
  label, requerido, ayuda, error, children,
}: {
  label: string;
  requerido?: boolean;
  ayuda?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label} {requerido && <span className="text-ink">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-ink">{error}</span>
      ) : ayuda ? (
        <span className="mt-1 block text-xs text-slate">{ayuda}</span>
      ) : null}
    </label>
  );
}

function ResumenFila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.14em] text-paper/40">{etiqueta}</div>
      <div className="mt-0.5 text-sm font-medium text-paper">{valor}</div>
    </div>
  );
}

function Exito({ onNueva }: { onNueva: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center py-10 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-silver">
        <CheckCircle weight="fill" size={42} className="text-ink" />
      </div>
      <h3 className="font-display mt-6 text-2xl font-bold text-ink">Cita confirmada</h3>
      <p className="mt-3 max-w-md text-slate">
        Tu cita quedo registrada. Recibiras la confirmacion por WhatsApp y correo en breve.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onNueva}
          className="rounded-[var(--radius-pill)] bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-95"
        >
          Agendar otra cita
        </button>
        <a
          href="#top"
          className="rounded-[var(--radius-pill)] px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-silver"
        >
          Volver al inicio
        </a>
      </div>
    </motion.div>
  );
}
