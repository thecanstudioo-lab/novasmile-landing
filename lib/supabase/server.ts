import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase del lado servidor con la ANON KEY.
// Solo LEE datos publicos (catalogo). RLS garantiza que anon no ve PII ni citas.
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // En Server Components la escritura de cookies puede no estar permitida.
          // La landing es publica y sin sesion, asi que ignoramos el fallo.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* noop: contexto de solo lectura */
          }
        },
      },
    },
  );
}
