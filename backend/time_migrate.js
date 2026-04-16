import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Running Time Tracking Migration...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_logs (
        id SERIAL PRIMARY KEY,
        task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        duration_minutes INT NOT NULL,
        description TEXT,
        log_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table "time_logs" created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
