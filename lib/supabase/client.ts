import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/types/supabase';

// Get the URL from environment or use default
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxiieunzrcdbxqadapcl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWlldW56cmNkYnhxYWRhcGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTAzMTIsImV4cCI6MjA2NDQ2NjMxMn0.87x8KfKhfQoJlmbBg1I1zHwEMIE-Uvk-THCFmEn-n6E';

export const createClient = () => createClientComponentClient<Database>({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
});