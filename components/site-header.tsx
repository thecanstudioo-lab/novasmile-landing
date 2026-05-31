"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, X, Tooth } from "@phosphor-icons/react";

const NAV = [
  { href: "#servicios", label: "Tratamientos" },
  { href: "#nosotros", label: "Por que NovaSmile" },
  { href: "#sedes", label: "Sedes" },
];

export function SiteHeader({ nombre }: { nombre: string }) {
  const [solido, setSolido] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setSolido(!entry!.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solido ? "bg-navy/90 backdrop-blur-md shadow-[0_1px_0_rgb(255_255_255/0.06)]" : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2 text-white" aria-label={nombre}>
          <Tooth weight="fill" className="text-gold" size={26} />
          <span className="font-display text-lg font-semibold tracking-tight">{nombre}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              {n.label}
            </a>
          ))}
          <a
            href="#reservar"
            className="rounded-[var(--radius-pill)] bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            Agendar valoracion
          </a>
        </nav>

        <button
          className="text-white md:hidden"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={abierto}
        >
          {abierto ? <X size={26} /> : <List size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {abierto && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden bg-navy/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setAbierto(false)}
                  className="rounded-lg px-3 py-3 text-base text-white/85 hover:bg-white/5"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#reservar"
                onClick={() => setAbierto(false)}
                className="mt-2 rounded-[var(--radius-pill)] bg-gold px-5 py-3 text-center text-base font-semibold text-navy"
              >
                Agendar valoracion
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
