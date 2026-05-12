import { createServerClient } from "@supabase/ssr";

// Note: These imports are for Next.js. In a Vite project, these will only work 
// if you are using a framework like Rspress or similar that supports them, 
// or if you are planning to migrate to Next.js.
// For the current Vite SPA, use the client in src/lib/supabase.ts instead.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pbjuojnasuzhvvfqmnfj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QpjQUQHQ9PhJ_4XhxtJ7lg_XpdxvODu';

export const createClient = (cookieStore: any) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    },
  );
};
