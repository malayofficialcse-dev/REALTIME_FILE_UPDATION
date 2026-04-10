import { pool } from '../src/config/db.js';

async function seedData() {
  try {
    console.log('Seeding demo data...');
    
    // 1. Get first user
    const userRes = await pool.query('SELECT id, email FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log('No users found. Please register first.');
      process.exit(1);
    }
    const userId = userRes.rows[0].id;
    const userEmail = userRes.rows[0].email;
    console.log(`Using user: ${userEmail} (ID: ${userId})`);

    // 2. Create Workspace
    const wsRes = await pool.query(
      "INSERT INTO workspaces (name) VALUES ('Strategic Operations Hub V4') RETURNING id"
    );
    const wsId = wsRes.rows[0].id;
    console.log(`Created Workspace: Strategic Operations Hub V4 (ID: ${wsId})`);

    // 3. Add user to workspace
    await pool.query(
      "INSERT INTO workspace_members (user_id, workspace_id, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING",
      [userId, wsId]
    );

    // 4. Seed Tasks for Matrix
    const demoTasks = [
      { title: 'Decommission Legacy Bridge', status: 'TODO', priority: 'CRITICAL' },
      { title: 'Neural Sync Optimization', status: 'IN_PROGRESS', priority: 'HIGH' },
      { title: 'Global Asset Audit v9', status: 'REVIEW', priority: 'MEDIUM' },
      { title: 'Infrastructure Hardening', status: 'DONE', priority: 'LOW' },
      { title: 'Emergency Protocol Reboot', status: 'TODO', priority: 'CRITICAL' },
      { title: 'Marketing Deck Finalization', status: 'REVIEW', priority: 'HIGH' },
      { title: 'Team Stream Presence Fix', status: 'IN_PROGRESS', priority: 'CRITICAL' },
      { title: 'API Gateway Scaling', status: 'DONE', priority: 'MEDIUM' },
    ];

    for (const task of demoTasks) {
      await pool.query(
        "INSERT INTO tasks (workspace_id, title, status, priority, assignee_id) VALUES ($1, $2, $3, $4, $5)",
        [wsId, task.title, task.status, task.priority, userId]
      );
    }

    console.log('Successfully seeded 8 demo missions into the Strategic Matrix.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedData();
