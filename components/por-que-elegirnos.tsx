"use client";

import { motion, useReducedMotion } from "motion/react";
import { Tooth, Cube, ShieldCheck, Clock } from "@phosphor-icons/react";

const RAZONES = [
  { icono: Cube, titulo: "Diseno digital 3D", texto: "Visualizas tu resultado antes de iniciar cualquier tratamiento." },
  { icono: Tooth, titulo: "Especialistas de elite", texto: "Equipo certificado en estetica, implantes y rehabilitacion oral." },
  { icono: ShieldCheck, titulo: "Bioseguridad total", texto: "Protocolos clinicos de grado hospitalario en cada cita." },
  { icono: Clock, titulo: "Atencion agil", texto: "Confirmacion y recordatorios automaticos por WhatsApp y correo." },
];

const STATS = [
  { valor: "12", etiqueta: "tratamientos premium" },
  { valor: "3D", etiqueta: "diseno de sonrisa" },
  { valor: "98%", etiqueta: "pacientes satisfechos" },
  { valor: "24h", etiqueta: "respuesta a tu solicitud" },
];

export function PorQueElegirnos() {
  const reduce = useReducedMotion();
  return (
    <section id="nosotros" className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[var(--radius-card)] border border-line shadow-[var(--shadow-lift)]"
        >
          {/* Imagen de demostracion. Reemplazar por foto real del equipo. */}
          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1100&q=80"
            alt="Equipo clinico de NovaSmile"
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
          <div className="grid grid-cols-2 gap-px bg-line">
            {STATS.map((st) => (
              <div key={st.etiqueta} className="bg-white px-5 py-5">
                <div className="font-display text-2xl font-semibold text-navy">{st.valor}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate">{st.etiqueta}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Por que NovaSmile</span>
          <h2 className="font-display mt-3 text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            Lujo clinico que se siente en cada detalle
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-slate">
            Combinamos tecnologia de punta con un trato humano y cercano. Aqui no agendas una cita,
            inicias la transformacion de tu sonrisa con un equipo que cuida cada milimetro.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {RAZONES.map((r, i) => {
              const Icono = r.icono;
              return (
                <motion.div
                  key={r.titulo}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-field)] bg-ivory">
                    <Icono weight="duotone" size={22} className="text-gold" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-navy">{r.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">{r.texto}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
