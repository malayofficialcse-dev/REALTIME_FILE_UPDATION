import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:rRkuCWFFYLGTsGNkbHVkoKvsDjCNXLQB@mainline.proxy.rlwy.net:43976/railway',
});

async function checkDb() {
  const users = await pool.query('SELECT * FROM users');
  console.log('Users:', users.rows);
  
  const workspaces = await pool.query('SELECT * FROM workspaces');
  console.log('\nWorkspaces:', workspaces.rows);

  const workspace_members = await pool.query('SELECT * FROM workspace_members');
  console.log('\nWorkspace Members:', workspace_members.rows);

  const documents = await pool.query('SELECT * FROM documents');
  console.log('\nDocuments:', documents.rows);
  
  pool.end();
}

checkDb().catch(console.error);
