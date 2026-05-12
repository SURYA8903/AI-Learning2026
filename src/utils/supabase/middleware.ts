import { createServerClient } from "@supabase/ssr";

// Note: This is a Next.js middleware pattern. In Vite, middleware is handled differently 
// (e.g., via the dev server or production hosting like Netlify/Vercel functions).

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pbjuojnasuzhvvfqmnfj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QpjQUQHQ9PhJ_4XhxtJ7lg_XpdxvODu';

export const createClient = (request: any) => {
  // Mocking NextResponse for non-Next.js environments to prevent crash
  const response = {
    next: () => ({ headers: {}, cookies: { set: () => {} } }),
  };

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // implementation details
        },
      },
    },
  );

  return supabase;
};
