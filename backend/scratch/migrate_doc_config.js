import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('Migrating documents table to add config JSONB...');
  try {
    await pool.query(`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::JSONB;
    `);
    console.log('✅ Migration successful');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}
migrate();
