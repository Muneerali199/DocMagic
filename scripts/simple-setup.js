const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SERVICE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample templates to insert
const sampleTemplates = [
  {
    id: '1',
    user_id: 'system',
    title: 'Professional Resume Template',
    description: 'A clean and modern resume template perfect for professionals',
    type: 'resume',
    content: {
      personalInfo: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY'
      },
      sections: []
    },
    is_public: true,
    is_default: true,
    tags: ['professional', 'modern'],
    difficulty_level: 'beginner',
    usage_count: 1247,
    rating: 4.8,
    preview_image: '/api/templates/1/preview',
    color_scheme: 'blue',
    industry: 'technology'
  },
  {
    id: '2',
    user_id: 'system',
    title: 'Creative Resume Template',
    description: 'A colorful and creative resume template for designers',
    type: 'resume',
    content: {
      personalInfo: {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+1 (555) 987-6543',
        location: 'San Francisco, CA'
      },
      sections: []
    },
    is_public: true,
    is_default: true,
    tags: ['creative', 'design'],
    difficulty_level: 'intermediate',
    usage_count: 892,
    rating: 4.6,
    preview_image: '/api/templates/2/preview',
    color_scheme: 'purple',
    industry: 'design'
  }
];

async function simpleSetup() {
  console.log('Starting simple database setup...');

  try {
    // Test basic connection
    console.log('Testing connection...');
    
    // Try to insert templates
    console.log('Attempting to insert templates...');
    const { data, error } = await supabase
      .from('templates')
      .insert(sampleTemplates)
      .select();

    if (error) {
      console.error('Insert error:', error);
      console.log('This likely means the templates table does not exist yet.');
      console.log('Please create the table manually in the Supabase dashboard using the SQL from scripts/supabase-setup.sql');
      return;
    }

    console.log('Success! Inserted templates:', data?.length || 0);
    console.log('Templates:');
    data?.forEach(t => console.log(`  - ${t.title} (${t.id})`));

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

simpleSetup();
