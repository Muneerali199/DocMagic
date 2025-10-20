import { createClient } from '@/lib/supabase/client';

export async function getAllUserEmails() {
  // Adjust table name and column as per your schema
  const supabase = createClient();
  const { data, error } = await supabase.from('users').select('email');
  if (error) throw error;
  return data?.map((u: { email: string }) => u.email) || [];
}
