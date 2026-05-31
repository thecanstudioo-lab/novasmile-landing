# NovaSmile Elite - Landing de conversion

Landing page publica, mobile-first, para que los pacientes agenden citas.
Filosofia: ver, leer, reservar, salir. Sin login, sin paneles, sin gestion de usuarios.

Stack: Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + Motion + Phosphor Icons + Supabase.

---

## 1. Que hace

- Lee el catalogo (servicios, especialistas, sedes) directo de tu base Supabase con la **anon key**.
- Muestra Hero, Servicios (dinamicos desde la BD), Por que elegirnos, Formulario de reserva y Footer con sedes.
- El formulario de reserva (Nombre, WhatsApp, Servicio, Especialista, Sede, Fecha/Hora, Correo, Mensaje)
  envia la cita a tu pipeline existente.

---

## 2. Instalacion

Requiere Node 18.18+ (recomendado Node 20).

```bash
npm install
cp .env.local.example .env.local   # y completa los valores
npm run dev                        # http://localhost:3000
```

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

---

## 3. Variables de entorno

| Variable | Tipo | Para que |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | publica | URL del proyecto (`https://khuewkknabdpqaiubjam.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publica | Llave anonima. Solo lee catalogo publico. |
| `NEXT_PUBLIC_TENANT_SUBDOMINIO` | publica | Tenant que sirve la landing (`novasmile`). |
| `BOOKING_WEBHOOK_SECRET` | **privada (solo servidor)** | Secreto HMAC con el que se firma la reserva antes de llamar a `book-appointment`. Debe ser identico al del panel de Edge Functions. |

> Si `BOOKING_WEBHOOK_SECRET` no esta configurado, el formulario no rompe: responde en
> "modo demo" con un aviso claro y no envia la cita. En cuanto cargas el secreto, las reservas
> reales empiezan a fluir.

---

## 4. Estado de la base de datos (ya aplicado)

Verifique tu instancia en vivo. Lo que el codigo asume **ya existe**:

- Tablas nuevas `servicios` y `especialistas` (creadas con la migracion `0011`), con
  politica RLS de **lectura publica** para filas activas. La anon key puede leerlas; nadie
  puede escribirlas por RLS.
- `servicios`: 12 tratamientos sembrados para NovaSmile (diseno de sonrisa, implantes,
  ortodoncia invisible, rehabilitacion oral, diseno 3D, carillas, blanqueamiento, estetica,
  endodoncia, infantil, maxilofacial, planes VIP).
- `especialistas`: 5 profesionales sembrados.
- `sedes`: 2 sedes sembradas (Chico y Norte, Bogota) con politica de lectura publica.
- `citas`: tabla existente. Sigue **cerrada** a la anon key (no se lee ni se inserta directo).

No necesitas correr ninguna migracion adicional para que la landing funcione.

---

## 5. Como se guarda la reserva (lee esto)

El formulario **no** hace un `INSERT` directo a `citas` con la anon key. Lo hace a proposito.

Tu automatizacion (Zapier -> Google Calendar / Sheets / Gmail) se dispara **dentro** de la
Edge Function `book-appointment`, no por un trigger de base de datos. Si la web insertara
directo en `citas`, la fila nunca llegaria a Zapier, no se crearia el evento en Calendar y el
cron de reconciliacion la marcaria como `huerfana` a los 10 minutos.

Por eso el flujo es:

```
Navegador (form)
   -> POST /api/reservar        (Route Handler, lado servidor de Next.js)
        - valida los datos
        - firma el cuerpo con HMAC-SHA256 usando BOOKING_WEBHOOK_SECRET
        - reenvia a la Edge Function
   -> book-appointment          (inserta en citas con service_role + fan-out a Zapier)
        -> Zapier -> Google Calendar / Sheets / Gmail
```

El secreto vive solo en el servidor (nunca llega al navegador). La anon key del navegador se
usa **solo para leer** el catalogo. Esto respeta el endurecimiento de seguridad que ya hiciste
(la escritura anonima directa a `citas` fue revocada por ser un hueco de seguridad).

Mapeo de campos al contrato de `book-appointment`:

| Campo del form | Va a |
|---|---|
| Nombre | `cita.paciente_nombre` |
| WhatsApp | `cita.paciente_telefono` (normalizado a E.164, ej. `+57...`) |
| Correo | `cita.paciente_email` |
| Servicio | `cita.servicio` (slug, ej. `implantes_dentales`) |
| Especialista | `cita.especialista_id` (nombre, o "Sin preferencia") |
| Sede | `cita.sede_id` + tambien embebida en `cita.notas` |
| Fecha/Hora | `cita.inicio` / `cita.fin` (ISO con offset `-05:00`, slots de 1h) |
| Mensaje | `cita.notas` |

> Nota: la Edge Function actual no persiste `sede_id` en la columna (queda null), por eso la
> sede elegida tambien se guarda dentro de `notas` para que el equipo la vea.

---

## 6. Estructura del proyecto

```
app/
  layout.tsx              Fuentes (Poppins/Inter), grano, sentinela del header
  page.tsx                Server Component: lee catalogo y arma la pagina
  globals.css             Tokens de marca (navy/oro/marfil) + utilidades
  api/reservar/route.ts   Firma HMAC y reenvia a book-appointment
lib/
  config.ts               Tenant, zona horaria
  supabase/server.ts      Cliente anon de lectura (server-side)
  catalog/                Tipos + lectores de servicios/especialistas/sedes
  booking/                Tipos + helpers de horarios
  icons.tsx               Mapa de iconos Phosphor
components/                Header, Hero, Servicios, PorQueElegirnos, Reserva, Footer, WhatsApp
```

---

## 7. Imagenes

El Hero y la seccion "Por que elegirnos" usan imagenes de demostracion de Unsplash
(marcadas con comentario en el codigo). Reemplazalas por fotos reales de la clinica antes de
publicar.

---

## 8. Despliegue en Vercel (siguiente fase)

1. Sube el proyecto a un repo y conectalo en Vercel (framework: Next.js, sin configuracion extra).
2. En Vercel, define las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TENANT_SUBDOMINIO`
   - `BOOKING_WEBHOOK_SECRET` (marcala como **sensible / solo servidor**, sin prefijo `NEXT_PUBLIC_`).
3. Deploy. Verifica una reserva de prueba y revisa que llegue a Calendar/Sheets/Gmail via Zapier.

---

## 9. Limites conocidos

- La grilla de horarios es indicativa (8:00 a 17:00, lun a sab). La verdad sobre choques de
  horario la arbitra Postgres: si el slot ya esta tomado, `book-appointment` responde 409 y la
  web lo muestra como "ese horario acaba de ocuparse".
- No hay captcha ni rate-limit en `/api/reservar`. Para produccion conviene agregar uno.
