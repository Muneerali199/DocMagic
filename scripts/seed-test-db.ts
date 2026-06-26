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

async function seed() {
  console.log('🌱 Starting test database seeding...');
  let hasError = false;

  // 1. Seed Test Users
  const testUsers = [
    { email: 'testuser1@draftdeckai.com', password: 'Password123!', id: '00000000-0000-0000-0000-000000000001' },
    { email: 'testuser2@draftdeckai.com', password: 'Password123!', id: '00000000-0000-0000-0000-000000000002' }
  ];

  for (const user of testUsers) {
    const { error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (error) {
      if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        console.log(`👤 User already exists: ${user.email}`);
      } else {
        console.error(`❌ Failed to create user ${user.email}:`, error);
        hasError = true;
      }
    } else {
      console.log(`👤 User processed: ${user.email}`);
    }
  }
  // Hardcoded date for deterministic snapshot testing
  const seededAt = '2024-01-01T00:00:00.000Z';

  // 2. Seed Sample Documents
  const sampleDocuments = [
    { id: '11111111-1111-1111-1111-111111111111', user_id: testUsers[0].id, title: 'Test Resume', type: 'resume', content: {}, created_at: seededAt },
    { id: '22222222-2222-2222-2222-222222222222', user_id: testUsers[0].id, title: 'Cover Letter', type: 'letter', content: {}, created_at: seededAt },
    { id: '33333333-3333-3333-3333-333333333333', user_id: testUsers[1].id, title: 'Business Presentation', type: 'presentation', content: {}, created_at: seededAt }
  ];

  const { error: docError } = await supabase.from('documents').upsert(sampleDocuments);
  if (docError) {
    console.error('❌ Failed to seed documents:', docError.message);
    hasError = true;
  } else {
    console.log('📄 Sample documents seeded successfully.');
  }

  // 3. Seed Usage Tracking Entries (Now with deterministic IDs)
  const sampleUsage = [
    { id: '44444444-4444-4444-4444-444444444441', user_id: testUsers[0].id, action: 'document_generation', credits_used: 1, timestamp: seededAt },
    { id: '44444444-4444-4444-4444-444444444442', user_id: testUsers[1].id, action: 'document_generation', credits_used: 2, timestamp: seededAt }
  ];

  const { error: usageError } = await supabase.from('usage_tracking').upsert(sampleUsage);
  if (usageError) {
    console.error('❌ Failed to seed usage tracking:', usageError.message);
    hasError = true;
  } else {
    console.log('📊 Usage tracking metrics seeded successfully.');
  }

  if (hasError) {
    console.error('❌ Seeding completed with errors.');
    process.exit(1);
  }

  console.log('✅ Test database seeding finished.');
}

seed().catch((err) => {
  console.error('❌ Fatal error during seeding:', err);
  process.exit(1);
});