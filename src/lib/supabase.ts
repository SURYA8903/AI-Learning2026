import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pbjuojnasuzhvvfqmnfj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QpjQUQHQ9PhJ_4XhxtJ7lg_XpdxvODu';

export const supabase = createClient(supabaseUrl, supabaseKey);
