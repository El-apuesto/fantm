require('dotenv').config();
const { Pool } = require('pg');

async function testDatabase() {
  try {
    console.log('Testing direct PostgreSQL connection...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const client = await pool.connect();
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tables = await client.query(tablesQuery);
    
    if (tables.rows.length > 0) {
      console.log('📋 Existing tables:', tables.rows.map(r => r.table_name).join(', '));
    } else {
      console.log('📋 No tables found - need to run schema');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase();
