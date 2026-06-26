import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_TEST_URL;
const supabaseServiceKey = process.env.SUPABASE_TEST_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_TEST_URL and SUPABASE_TEST_SERVICE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function cleanup() {
  console.log('🧹 Starting test database cleanup...');

  // 1. Delete rows from application tables
  const tables = ['usage_tracking', 'documents'];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes everything
    if (error) {
      console.error(`❌ Failed to clean table ${table}:`, error.message);
    } else {
      console.log(`🗑️ Cleared data from table: ${table}`);
    }
  }

  // 2. Remove test users from auth system
  const targetUserIds = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002'
  ];

  for (const id of targetUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error && error.message !== 'User not found') {
      console.error(`❌ Failed to delete auth user ${id}:`, error.message);
    }
  }
  console.log('👤 Cleaned up integration test auth users.');
  console.log('✅ Test database cleanup finished.');
}

cleanup();