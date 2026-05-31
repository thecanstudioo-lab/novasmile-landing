// Configuracion central de la landing. Un solo tenant servido en la raiz "/".
// El subdominio se resuelve a un tenant_id real en la tabla `tenants`.

export const TENANT_SUBDOMINIO =
  process.env.NEXT_PUBLIC_TENANT_SUBDOMINIO?.trim() || "novasmile";

// Fallback del id de NovaSmile (verificado en la instancia khuewkknabdpqaiubjam).
// Solo se usa si la lectura de `tenants` fallara; la fuente real es la base.
export const TENANT_ID_FALLBACK = "6a72b1f9-deb7-4a5d-9553-641f6e752675";

// Zona horaria de la clinica (Bogota). Usada para construir slots ISO.
export const TZ = "America/Bogota";
export const TZ_OFFSET = "-05:00";
