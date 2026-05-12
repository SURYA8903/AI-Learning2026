import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbjuojnasuzhvvfqmnfj.supabase.co';
const supabaseKey = 'sb_publishable_QpjQUQHQ9PhJ_4XhxtJ7lg_XpdxvODu'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase.from('assessments').select('*').limit(1);
  if (error) {
    console.error('Error fetching assessment:', error);
  } else {
    console.log('Assessment columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No data');
  }

  const { data: enrollments, error: enrollError } = await supabase.from('enrollments').select('*').limit(1);
  if (enrollError) {
    console.error('Error fetching enrollment:', enrollError);
  } else {
    console.log('Enrollment columns:', enrollments && enrollments.length > 0 ? Object.keys(enrollments[0]) : 'No data');
  }
}

inspect();
