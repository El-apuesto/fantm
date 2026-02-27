require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Test basic connection
    const { data, error } = await supabase.from('stories').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase error:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📊 Stories count query worked');
    }
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
  }
}

testSupabase();
