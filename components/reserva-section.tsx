"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  CheckCircle,
  CircleNotch,
  CaretRight,
  CaretLeft,
  Calendar,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import type { Servicio, Especialista, Sede } from "@/lib/catalog/types";
import type { ReservaInput, ReservaResultado } from "@/lib/booking/types";
import { proximosDias, slotsParaFecha, fechaCorta, slotLegible, type Slot } from "@/lib/booking/slots";

type Datos = { nombre: string; telefono: string; email: string; notas: string; consentimiento: boolean };

const DIAS = 14;

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
  const dias = useMemo(() => proximosDias(DIAS), []);

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [servicioSlug, setServicioSlug] = useState<string>("");
  const [especialistaId, setEspecialistaId] = useState<string>("");
  const [sedeId, setSedeId] = useState<string>(sedes[0]?.id ?? "");
  const [diaIdx, setDiaIdx] = useState<number>(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [datos, setDatos] = useState<Datos>({ nombre: "", telefono: "", email: "", notas: "", consentimiento: false });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ReservaResultado | null>(null);

  // Preseleccion desde la seccion de servicios.
  useEffect(() => {
    function onSelect(e: Event) {
      const slug = (e as CustomEvent<string>).detail;
      if (servicios.some((s) => s.slug === slug)) {
        setServicioSlug(slug);
        setPaso(1);
        setResultado(null);
      }
    }
    window.addEventListener("novasmile:select-servicio", onSelect);
    return () => window.removeEventListener("novasmile:select-servicio", onSelect);
  }, [servicios]);

  const servicioSel = servicios.find((s) => s.slug === servicioSlug) ?? null;
  const especialistaSel = especialistas.find((e) => e.id === especialistaId) ?? null;
  const sedeSel = sedes.find((s) => s.id === sedeId) ?? null;
  const diaSel = dias[diaIdx] ?? dias[0]!;
  const slots = useMemo(() => slotsParaFecha(diaSel), [diaSel]);

  const puedePaso1 = Boolean(servicioSlug && sedeId);
  const puedePaso2 = Boolean(slot);

  async function enviar() {
    if (enviando) return;
    setEnviando(true);
    setResultado(null);

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
        body: JSON.stringify(payload), // <-- Enviamos el payload mapeado, no el input antiguo
      });

      const json = (await resp.json()) as ReservaResultado;
      setResultado(json);
    } catch {
      setResultado({ ok: false, code: "ERROR_RED", mensaje: "No pudimos enviar tu solicitud. Intenta de nuevo." });
    } finally {
      setEnviando(false);
    }
  }

  const exito = resultado !== null && (resultado.ok || resultado.code === "CONFIG_PENDIENTE");

  return (
    <section id="reservar" className="bg-aurora-navy relative grain py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Agenda tu valoracion
          </h2>
          <p className="mt-3 text-white/70">
            Tres pasos rapidos. Te confirmamos por WhatsApp y correo.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
          {/* Panel principal */}
          <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-lift)] sm:p-8">
            <AnimatePresence mode="wait">
              {exito ? (
                <Exito key="exito" resultado={resultado!} />
              ) : (
                <motion.div
                  key={`paso-${paso}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -18 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                    <PasoFecha
                      dias={dias}
                      diaIdx={diaIdx}
                      slots={slots}
                      slot={slot}
                      onDia={(i) => { setDiaIdx(i); setSlot(null); }}
                      onSlot={setSlot}
                    />
                  )}

                  {paso === 3 && <PasoDatos datos={datos} onCambio={(d) => setDatos({ ...datos, ...d })} resultado={resultado} />}

                  {/* Error global no ligado a un campo */}
                  {resultado && !resultado.ok && resultado.code !== "VALIDACION" && resultado.code !== "CONFIG_PENDIENTE" && (
                    <div className="mt-5 flex items-start gap-2 rounded-[var(--radius-field)] bg-red-50 px-4 py-3 text-sm text-red-700">
                      <WarningCircle weight="fill" className="mt-0.5 shrink-0" />
                      <span>{resultado.mensaje}</span>
                    </div>
                  )}

                  {/* Navegacion */}
                  <div className="mt-7 flex items-center justify-between gap-3">
                    {paso > 1 ? (
                      <button
                        onClick={() => setPaso((p) => (p - 1) as 1 | 2)}
                        className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-4 py-2.5 text-sm font-medium text-slate transition-colors hover:bg-ivory"
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
                        className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Continuar <CaretRight weight="bold" />
                      </button>
                    ) : (
                      <button
                        onClick={enviar}
                        disabled={enviando}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-gold px-7 py-3 text-sm font-semibold text-navy transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                      >
                        {enviando ? (
                          <>
                            <CircleNotch weight="bold" className="animate-spin" /> Enviando...
                          </>
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

          {/* Rail de resumen */}
          <aside className="glass-dark hidden rounded-[var(--radius-card)] p-6 text-white lg:block">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-gold-soft">Tu reserva</h3>
            <div className="mt-5 space-y-4">
              <ResumenFila etiqueta="Tratamiento" valor={servicioSel?.titulo ?? "Por elegir"} />
              <ResumenFila etiqueta="Especialista" valor={especialistaSel?.nombre ?? "Sin preferencia"} />
              <ResumenFila etiqueta="Sede" valor={sedeSel?.nombre ?? "Por elegir"} />
              <ResumenFila etiqueta="Fecha y hora" valor={slot ? slotLegible(slot.inicioISO) : "Por elegir"} />
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/55">
              Al confirmar, tu cita queda registrada y un asesor la valida. Recibiras la confirmacion
              por los canales que dejes.
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
    <div className="mb-7 flex items-center gap-2">
      {items.map((it, i) => (
        <div key={it.n} className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${paso >= it.n ? "bg-navy text-white" : "bg-ivory text-slate"
              }`}
          >
            {it.n}
          </div>
          <span className={`hidden text-xs font-medium sm:inline ${paso >= it.n ? "text-navy" : "text-slate"}`}>
            {it.label}
          </span>
          {i < items.length - 1 && (
            <div className={`h-px flex-1 ${paso > it.n ? "bg-navy" : "bg-line"}`} />
          )}
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
      <h3 className="font-display text-xl font-semibold text-navy">Que te gustaria mejorar?</h3>

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

function PasoFecha({
  dias, diaIdx, slots, slot, onDia, onSlot,
}: {
  dias: Date[];
  diaIdx: number;
  slots: Slot[];
  slot: Slot | null;
  onDia: (i: number) => void;
  onSlot: (s: Slot) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="font-display flex items-center gap-2 text-xl font-semibold text-navy">
        <Calendar weight="duotone" className="text-gold" /> Elige fecha y hora
      </h3>

      {/* Dias */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dias.map((d, i) => {
          const { dia, num, mes } = fechaCorta(d);
          const activo = i === diaIdx;
          return (
            <button
              key={d.toISOString()}
              onClick={() => onDia(i)}
              className={`flex min-w-[64px] shrink-0 flex-col items-center rounded-[var(--radius-field)] border px-3 py-2.5 transition-colors ${activo ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-gold/50"
                }`}
            >
              <span className="text-[11px] uppercase opacity-70">{dia}</span>
              <span className="font-display text-lg font-semibold leading-tight">{num}</span>
              <span className="text-[11px] uppercase opacity-70">{mes}</span>
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((s) => {
          const activo = slot?.inicioISO === s.inicioISO;
          return (
            <button
              key={s.inicioISO}
              onClick={() => onSlot(s)}
              className={`rounded-[var(--radius-field)] border px-2 py-2.5 text-sm font-medium transition-colors ${activo ? "border-gold bg-gold/10 text-navy" : "border-line bg-white text-slate hover:border-gold/50"
                }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate">Horario de atencion: lunes a sabado, 8:00 a.m. a 5:00 p.m.</p>
    </div>
  );
}

function PasoDatos({
  datos, onCambio, resultado,
}: {
  datos: Datos;
  onCambio: (d: Partial<Datos>) => void;
  resultado: ReservaResultado | null;
}) {
  const validacion = resultado && !resultado.ok && resultado.code === "VALIDACION" ? resultado : null;
  const map: Record<string, string> = {
    pacienteNombre: "nombre",
    pacienteTelefono: "telefono",
    pacienteEmail: "email",
    consentimiento: "consentimiento",
  };
  const campoConError = validacion?.campo ? map[validacion.campo] : undefined;
  const mensajeError = validacion?.mensaje;

  return (
    <div className="space-y-4">
      <h3 className="font-display flex items-center gap-2 text-xl font-semibold text-navy">
        <User weight="duotone" className="text-gold" /> Tus datos de contacto
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Nombre completo" requerido error={campoConError === "nombre" ? mensajeError : undefined}>
          <input
            className="field"
            value={datos.nombre}
            onChange={(e) => onCambio({ nombre: e.target.value })}
            placeholder="Maria Fernanda Gomez"
            autoComplete="name"
          />
        </Campo>
        <Campo label="WhatsApp" requerido error={campoConError === "telefono" ? mensajeError : undefined}>
          <input
            className="field"
            value={datos.telefono}
            onChange={(e) => onCambio({ telefono: e.target.value })}
            placeholder="300 111 2233"
            inputMode="tel"
            autoComplete="tel"
          />
        </Campo>
      </div>

      <Campo label="Correo electronico" ayuda="Opcional. Te enviamos la confirmacion aqui." error={campoConError === "email" ? mensajeError : undefined}>
        <input
          className="field"
          value={datos.email}
          onChange={(e) => onCambio({ email: e.target.value })}
          placeholder="tucorreo@ejemplo.com"
          inputMode="email"
          autoComplete="email"
        />
      </Campo>

      <Campo label="Mensaje" ayuda="Opcional. Cuentanos que buscas.">
        <textarea
          className="field min-h-[80px] resize-none"
          value={datos.notas}
          onChange={(e) => onCambio({ notas: e.target.value })}
          placeholder="Quiero una valoracion para diseno de sonrisa."
        />
      </Campo>

      <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-field)] bg-ivory p-3 text-sm text-slate">
        <input
          type="checkbox"
          checked={datos.consentimiento}
          onChange={(e) => onCambio({ consentimiento: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[color:var(--color-gold)]"
        />
        <span>
          Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 (Habeas Data)
          para gestionar mi cita.
        </span>
      </label>
      {campoConError === "consentimiento" && mensajeError && (
        <p className="text-sm text-red-600">{mensajeError}</p>
      )}
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
      <span className="mb-1.5 block text-sm font-medium text-navy">
        {label} {requerido && <span className="text-gold">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : ayuda ? (
        <span className="mt-1 block text-xs text-slate">{ayuda}</span>
      ) : null}
    </label>
  );
}

function ResumenFila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-white/45">{etiqueta}</div>
      <div className="mt-0.5 text-sm font-medium text-white">{valor}</div>
    </div>
  );
}

function Exito({ resultado }: { resultado: ReservaResultado }) {
  const demo = !resultado.ok && resultado.code === "CONFIG_PENDIENTE";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center py-8 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
        <CheckCircle weight="fill" size={42} className="text-green-600" />
      </div>
      <h3 className="font-display mt-5 text-2xl font-semibold text-navy">Solicitud recibida</h3>
      <p className="mt-3 max-w-md text-slate">
        {demo
          ? "Tu solicitud se proceso en modo demostracion. Configura el secreto del servidor para enviarla a la clinica."
          : "Tu cita quedo registrada. Un asesor de NovaSmile la confirmara muy pronto por WhatsApp y correo."}
      </p>
      <a
        href="#top"
        className="mt-7 inline-flex rounded-[var(--radius-pill)] bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        Volver al inicio
      </a>
    </motion.div>
  );
}
