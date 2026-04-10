import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('Migrating comments table...');
  try {
    await pool.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS cell_row INTEGER,
      ADD COLUMN IF NOT EXISTS cell_col INTEGER,
      ADD COLUMN IF NOT EXISTS char_offset INTEGER,
      ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE;
    `);
    console.log('✅ Migration successful');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}
migrate();
