import { pool } from '../src/config/db.js';

async function addUsersToWorkspace() {
  try {
    const wsName = 'Strategic Operations Hub V4';
    const wsRes = await pool.query("SELECT id FROM workspaces WHERE name = $1 LIMIT 1", [wsName]);
    if (wsRes.rows.length === 0) {
      console.log('Workspace not found.');
      process.exit(1);
    }
    const wsId = wsRes.rows[0].id;

    const usersRes = await pool.query("SELECT id, email FROM users WHERE email LIKE '%@prosync.com'");
    
    console.log(`Adding users to ${wsName}...`);
    for (const user of usersRes.rows) {
      await pool.query(
        "INSERT INTO workspace_members (user_id, workspace_id, role) VALUES ($1, $2, 'editor') ON CONFLICT DO NOTHING",
        [user.id, wsId]
      );
      console.log(`Added: ${user.email}`);
    }
    
    console.log('\nAll personnel successfully mobilized.');
    process.exit(0);
  } catch (err) {
    console.error('Mobilization failed:', err);
    process.exit(1);
  }
}

addUsersToWorkspace();
