import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const applyConstraint = async () => {
  try {
    console.log('⏳ Applying Unique Constraint...');
    await pool.query('ALTER TABLE workspace_members ADD CONSTRAINT unique_user_workspace UNIQUE (user_id, workspace_id)');
    console.log('✅ Constraint successfully applied!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error applying constraint:', err.message);
    process.exit(1);
  }
};

applyConstraint();
