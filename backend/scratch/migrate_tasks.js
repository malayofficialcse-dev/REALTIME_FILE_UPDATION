import { pool } from '../src/config/db.js';

async function migrateTasks() {
  try {
    console.log('Starting migration for tasks table...');
    
    // Add priority
    await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM'`);
    console.log('Added priority column.');

    // Add updated_at
    await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('Added updated_at column.');

    // Rename assigned_to to assignee_id if it exists
    try {
      await pool.query(`ALTER TABLE tasks RENAME COLUMN assigned_to TO assignee_id`);
      console.log('Renamed assigned_to to assignee_id.');
    } catch (e) {
      console.log('assigned_to column might not exist or already renamed.');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateTasks();
