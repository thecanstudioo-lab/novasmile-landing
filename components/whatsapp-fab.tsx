"use client";

import { motion, useReducedMotion } from "motion/react";
import { WhatsappLogo } from "@phosphor-icons/react";

export function WhatsappFab({ telefono }: { telefono: string }) {
  const reduce = useReducedMotion();
  const numero = telefono.replace(/[^\d]/g, "");
  const mensaje = encodeURIComponent("Hola, quiero agendar una valoracion estetica en NovaSmile.");

  return (
    <motion.a
      href={`https://wa.me/${numero}?text=${mensaje}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribenos por WhatsApp"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 260, damping: 18, delay: 0.8 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[#25D366] px-4 py-3 text-white shadow-[0_10px_30px_rgb(37_211_102/0.45)]"
    >
      <WhatsappLogo weight="fill" size={26} />
      <span className="hidden text-sm font-semibold sm:inline">Escribenos</span>
    </motion.a>
  );
}
