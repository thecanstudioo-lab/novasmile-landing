"use client";

// components/booking/Calendar.tsx
// Calendario de mes completo, paginado por mes, 100% touch-friendly y sin librerias.
// Conserva la lógica original pero adaptado a paleta Dental (Blanco, Azul, Amarillo) y layout responsivo.

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
// indice de dia con semana iniciando en lunes (0 = lun ... 6 = dom)
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

export function Calendar({
    value,
    onChange,
    minDate,
    isDayEnabled,
}: {
    value: Date | null;
    onChange: (d: Date) => void;
    minDate?: Date;
    /** Permite marcar dias no disponibles (p. ej. festivos). Domingo ya viene cerrado. */
    isDayEnabled?: (d: Date) => boolean;
}) {
    const reduce = useReducedMotion();
    const today = startOfDay(new Date());
    const min = startOfDay(minDate ?? today);
    const [view, setView] = useState<Date>(firstOfMonth(value ?? min));

    const canGoPrev = firstOfMonth(view) > firstOfMonth(min);

    const cells = useMemo<(Date | null)[]>(() => {
        const first = firstOfMonth(view);
        const lead = mondayIndex(first);
        const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        const arr: (Date | null)[] = Array.from({ length: lead }, () => null);
        for (let d = 1; d <= total; d++) arr.push(new Date(view.getFullYear(), view.getMonth(), d));
        while (arr.length % 7 !== 0) arr.push(null);
        return arr;
    }, [view]);

    function enabled(d: Date) {
        if (startOfDay(d) < min) return false;   // dias pasados
        if (d.getDay() === 0) return false;       // domingo cerrado (lun-sab)
        return isDayEnabled ? isDayEnabled(d) : true;
    }

    return (
        /* Contenedor blindado: max-w para PC, w-full para móvil, p-4 para respirar */
        <div className="select-none w-full max-w-sm sm:max-w-md mx-auto bg-paper p-4 rounded-2xl border border-silver shadow-soft">

            {/* Navegacion de mes */}
            <div className="flex items-center justify-between pb-4">
                <button
                    type="button"
                    onClick={() => canGoPrev && setView((v) => addMonths(v, -1))}
                    disabled={!canGoPrev}
                    aria-label="Mes anterior"
                    className="grid h-11 w-11 place-items-center rounded-full text-navy transition-[background-color,transform] hover:bg-clinical active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent"
                >
                    <CaretLeft size={24} weight="bold" />
                </button>
                <div className="font-display text-lg font-bold capitalize text-navy">
                    {MESES[view.getMonth()]} {view.getFullYear()}
                </div>
                <button
                    type="button"
                    onClick={() => setView((v) => addMonths(v, 1))}
                    aria-label="Mes siguiente"
                    className="grid h-11 w-11 place-items-center rounded-full text-navy transition-[background-color,transform] hover:bg-clinical active:scale-95"
                >
                    <CaretRight size={24} weight="bold" />
                </button>
            </div>

            {/* Encabezados de dia */}
            <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((w, i) => (
                    <div key={i} className="py-1 text-center text-xs font-bold uppercase tracking-wide text-slate">
                        {w}
                    </div>
                ))}
            </div>

            {/* Grilla del mes (transicion sobria al cambiar de mes) */}
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={`${view.getFullYear()}-${view.getMonth()}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    className="mt-1 grid grid-cols-7 gap-1 h-auto"
                >
                    {cells.map((d, i) =>
                        d === null ? (
                            <div key={`b-${i}`} aria-hidden className="aspect-square" />
                        ) : (
                            (() => {
                                const isSel = !!value && sameDay(d, value);
                                const isToday = sameDay(d, today);
                                const ok = enabled(d);
                                return (
                                    <button
                                        key={d.toISOString()}
                                        type="button"
                                        disabled={!ok}
                                        onClick={() => onChange(d)}
                                        aria-pressed={isSel}
                                        aria-label={d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                                        className={[
                                            "relative grid aspect-square w-full min-h-[44px] place-items-center rounded-xl text-sm font-semibold",
                                            "transition-[background-color,color,transform,box-shadow] duration-150",
                                            isSel
                                                ? "bg-navy text-paper shadow-md" // Tu azul dental cuando se selecciona
                                                : ok
                                                    ? "text-ink hover:bg-clinical hover:text-navy active:scale-95" // Azul clarito al pasar el dedo/mouse
                                                    : "cursor-not-allowed text-slate/30",
                                        ].join(" ")}
                                    >
                                        {d.getDate()}
                                        {/* El puntito amarillo para indicar "HOY" */}
                                        {isToday && !isSel && (
                                            <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-gold" />
                                        )}
                                    </button>
                                );
                            })()
                        )
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}