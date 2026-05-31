"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Servicio } from "@/lib/catalog/types";
import { ICONOS } from "@/lib/icons";

function preseleccionar(slug: string) {
  window.dispatchEvent(new CustomEvent("novasmile:select-servicio", { detail: slug }));
  document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ServiciosSection({ servicios }: { servicios: Servicio[] }) {
  const destacados = servicios.filter((s) => s.destacado).slice(0, 5);
  const resto = servicios.filter((s) => !s.destacado);

  // Ritmo del bento: primer tile ancho, luego pares.
  const spans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"];

  return (
    <section id="servicios" className="relative bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Tratamientos</span>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            Un portafolio completo para cada sonrisa
          </h2>
          <div className="rule-gold mt-5" />
        </Reveal>

        {/* Bento de destacados */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {destacados.map((s, i) => {
            const Icono = ICONOS[s.icono];
            const oscuro = i === 0 || i === 3;
            return (
              <Reveal key={s.id} delay={i * 0.05} className={spans[i] ?? "lg:col-span-4"}>
                <button
                  onClick={() => preseleccionar(s.slug)}
                  className={`group relative flex h-full min-h-[200px] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-card)] p-6 text-left transition-all duration-300 hover:shadow-[var(--shadow-lift)] ${
                    oscuro
                      ? "bg-navy text-white"
                      : "border border-line bg-white text-navy shadow-[var(--shadow-soft)]"
                  }`}
                >
                  {oscuro && (
                    <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/15 blur-2xl" />
                  )}
                  <span
                    className={`relative inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-field)] ${
                      oscuro ? "bg-white/10" : "bg-ivory"
                    }`}
                  >
                    <Icono weight="duotone" size={26} className="text-gold" />
                  </span>
                  <div className="relative mt-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-xl font-semibold">{s.titulo}</h3>
                      <ArrowUpRight
                        className={`shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                          oscuro ? "text-white/60" : "text-slate"
                        }`}
                      />
                    </div>
                    <p className={`mt-2 text-sm leading-relaxed ${oscuro ? "text-white/70" : "text-slate"}`}>
                      {s.resumen}
                    </p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Grid compacto del resto */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resto.map((s, i) => {
            const Icono = ICONOS[s.icono];
            return (
              <Reveal key={s.id} delay={(i % 3) * 0.05}>
                <button
                  onClick={() => preseleccionar(s.slug)}
                  className="group flex h-full w-full items-start gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 text-left transition-all duration-300 hover:border-gold/40 hover:shadow-[var(--shadow-soft)]"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-field)] bg-ivory">
                    <Icono weight="duotone" size={22} className="text-navy" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-navy">{s.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">{s.resumen}</p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
