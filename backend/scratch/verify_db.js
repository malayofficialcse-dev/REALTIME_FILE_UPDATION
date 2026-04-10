import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('DB URL:', process.env.DATABASE_URL);

async function verify() {
  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority'");
  console.log('Priority column found counts:', res.rows.length);
  process.exit(0);
}
verify();
