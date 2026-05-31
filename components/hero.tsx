"use client";

import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, Sparkle, ArrowRight } from "@phosphor-icons/react";

export function Hero({ ciudad }: { ciudad: string }) {
  const reduce = useReducedMotion();

  const enter = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="bg-aurora-navy relative grain min-h-[100dvh] overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pt-28 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24 lg:pb-0 lg:min-h-[100dvh]">
        {/* Columna de contenido */}
        <div className="relative z-10">
          <motion.span
            {...enter(0)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-soft"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Odontologia estetica de alta gama, {ciudad}
          </motion.span>

          <motion.h1
            {...enter(0.08)}
            className="font-display mt-6 text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          >
            Tu mejor sonrisa,
            <br />
            disenada con <span className="italic text-gold">precision</span>.
          </motion.h1>

          <motion.p {...enter(0.16)} className="mt-5 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            Tecnologia digital 3D, especialistas de elite y un trato a la altura de tu sonrisa.
            Agenda tu valoracion en menos de un minuto.
          </motion.p>

          <motion.div {...enter(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#reservar"
              className="group inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-gold px-7 py-3.5 text-base font-semibold text-navy transition-transform hover:scale-[1.03] active:scale-95"
            >
              Reservar mi cita
              <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-white/20 px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/5"
            >
              <Sparkle weight="fill" className="text-gold" />
              Ver tratamientos
            </a>
          </motion.div>

          <motion.div {...enter(0.32)} className="mt-8 flex items-center gap-2 text-sm text-white/55">
            <ShieldCheck weight="fill" className="text-gold-soft" />
            Datos protegidos conforme a la Ley 1581 de 2012 (Habeas Data).
          </motion.div>
        </div>

        {/* Columna de imagen */}
        <motion.div
          {...enter(0.2)}
          className="relative z-10 hidden lg:block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-white/10 shadow-[var(--shadow-lift)]">
            {/* Imagen de demostracion. Reemplazar por foto real de la clinica. */}
            <img
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1100&q=80"
              alt="Consultorio dental moderno de NovaSmile"
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
            <div className="glass-dark absolute bottom-4 left-4 right-4 rounded-[var(--radius-field)] px-4 py-3">
              <p className="text-sm font-medium text-white">Diseno digital de sonrisa</p>
              <p className="text-xs text-white/65">Visualiza tu resultado antes de empezar</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
