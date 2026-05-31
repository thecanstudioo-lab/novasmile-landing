import { getTenant, getServicios, getEspecialistas, getSedes } from "@/lib/catalog/get-catalog";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { ServiciosSection } from "@/components/servicios-section";
import { PorQueElegirnos } from "@/components/por-que-elegirnos";
import { ReservaSection } from "@/components/reserva-section";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";

// La landing se revalida con frecuencia para reflejar cambios del catalogo en la BD.
export const revalidate = 300;

export default async function Home() {
  const tenant = await getTenant();
  const [servicios, especialistas, sedes] = await Promise.all([
    getServicios(tenant.id),
    getEspecialistas(tenant.id),
    getSedes(tenant.id),
  ]);

  // Numero de WhatsApp: primer telefono de sede disponible, con respaldo.
  const whatsapp = sedes.find((s) => s.telefono)?.telefono ?? "+573001112233";
  const ciudad = sedes.find((s) => s.ciudad)?.ciudad ?? "Bogota";

  return (
    <>
      <SiteHeader nombre={tenant.nombre} />
      <main>
        <Hero ciudad={ciudad} />
        <ServiciosSection servicios={servicios} />
        <PorQueElegirnos />
        <ReservaSection servicios={servicios} especialistas={especialistas} sedes={sedes} />
      </main>
      <SiteFooter nombre={tenant.nombre} sedes={sedes} />
      <WhatsappFab telefono={whatsapp} />
    </>
  );
}
