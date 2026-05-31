import { Tooth, MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import type { Sede } from "@/lib/catalog/types";

export function SiteFooter({ nombre, sedes }: { nombre: string; sedes: Sede[] }) {
  const anio = new Date().getFullYear();

  return (
    <footer id="sedes" className="bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-2 text-white">
            <Tooth weight="fill" className="text-gold" size={24} />
            <span className="font-display text-lg font-semibold">{nombre}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Odontologia estetica y rehabilitacion oral de alta gama en Bogota. Disenamos sonrisas
            con tecnologia digital y un trato a tu altura.
          </p>
        </div>

        {/* Sedes */}
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-gold-soft">
            Nuestras sedes
          </h3>
          <ul className="mt-4 space-y-4">
            {sedes.length === 0 && <li className="text-sm text-white/50">Proximamente.</li>}
            {sedes.map((s) => (
              <li key={s.id} className="text-sm">
                <div className="flex items-start gap-2">
                  <MapPin weight="fill" className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <p className="font-medium text-white">{s.nombre}</p>
                    {s.direccion && <p className="text-white/60">{s.direccion}</p>}
                    {s.ciudad && <p className="text-white/45">{s.ciudad}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-gold-soft">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {sedes[0]?.telefono && (
              <li className="flex items-center gap-2">
                <Phone weight="fill" className="text-gold" />
                <a href={`tel:${sedes[0].telefono}`} className="hover:text-white">
                  {sedes[0].telefono}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2">
              <EnvelopeSimple weight="fill" className="text-gold" />
              <a href="mailto:citas@novasmile.co" className="hover:text-white">
                citas@novasmile.co
              </a>
            </li>
            <li className="pt-2">
              <a
                href="#reservar"
                className="inline-flex rounded-[var(--radius-pill)] bg-gold px-5 py-2.5 font-semibold text-navy transition-transform hover:scale-[1.03]"
              >
                Agendar valoracion
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            &copy; {anio} {nombre}. Todos los derechos reservados.
          </p>
          <p>Datos tratados conforme a la Ley 1581 de 2012 (Habeas Data).</p>
        </div>
      </div>
    </footer>
  );
}
