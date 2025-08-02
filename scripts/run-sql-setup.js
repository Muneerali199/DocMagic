const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSetup() {
  console.log('Setting up Supabase database...');
  console.log('URL:', supabaseUrl);

  try {
    // Test connection first
    console.log('Testing connection...');
    const { data, error: testError } = await supabase
      .from('_test')
      .select('*')
      .limit(1);
    
    if (testError && !testError.message.includes('does not exist')) {
      console.error('Connection test failed:', testError);
      return;
    }
    
    console.log('Connection successful!');

    // Read and execute the SQL setup
    const sqlPath = path.join(__dirname, 'supabase-setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';'
          });
          
          if (error) {
            console.log(`Statement ${i + 1} note:`, error.message);
          }
        } catch (err) {
          console.log(`Statement ${i + 1} note:`, err.message);
        }
      }
    }

    // Test if templates table was created by trying to select from it
    console.log('Testing templates table...');
    const { data: templates, error: selectError } = await supabase
      .from('templates')
      .select('id, title')
      .limit(5);

    if (selectError) {
      console.error('Templates table test failed:', selectError.message);
    } else {
      console.log(`Templates table ready! Found ${templates?.length || 0} templates.`);
      if (templates && templates.length > 0) {
        console.log('Sample templates:');
        templates.forEach(t => console.log(`  - ${t.title} (${t.id})`));
      }
    }

    console.log('Database setup complete!');

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

runSetup();
