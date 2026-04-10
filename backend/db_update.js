import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:rRkuCWFFYLGTsGNkbHVkoKvsDjCNXLQB@mainline.proxy.rlwy.net:43976/railway',
});

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      sender_id INT REFERENCES users(id),
      workspace_id INT REFERENCES workspaces(id),
      type VARCHAR(50) NOT NULL,
      role VARCHAR(50),
      status VARCHAR(20) DEFAULT 'PENDING',
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Notifications table created successfully.');
  process.exit(0);
}
run().catch(console.error);
