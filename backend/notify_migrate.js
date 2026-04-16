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
    console.log('Running Notification Migration...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        sender_id INT REFERENCES users(id) ON DELETE SET NULL,
        workspace_id INT REFERENCES workspaces(id) ON DELETE SET NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table "notifications" verified/created.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
