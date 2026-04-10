import { pool } from '../../config/db.js';

export const workspaceResolver = {
  Query: {
    workspaces: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query(
        `SELECT w.* FROM workspaces w
         JOIN workspace_members wm ON wm.workspace_id = w.id
         WHERE wm.user_id = $1`,
        [user.userId]
      );
      return res.rows;
    },
    workspace: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query('SELECT * FROM workspaces WHERE id = $1', [id]);
      return res.rows[0];
    },
    workspaceAnalytics: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const docsRes = await pool.query('SELECT type FROM documents WHERE workspace_id = $1', [id]);
      const membersRes = await pool.query(`
        SELECT u.email, COUNT(d.id) as doc_count FROM users u
        JOIN workspace_members wm ON wm.user_id = u.id
        LEFT JOIN documents d ON d.owner_id = u.id AND d.workspace_id = $1
        WHERE wm.workspace_id = $1
        GROUP BY u.email
      `, [id]);

      const docs = docsRes.rows;
      const types = { text: 0, sheet: 0 };
      docs.forEach(d => { types[d.type] = (types[d.type] || 0) + 1; });
      
      const assetDistribution = Object.entries(types).map(([label, value]) => ({
        label: label === 'text' ? 'Documents' : 'Spreadsheets',
        value: parseFloat(value.toString()),
        color: label === 'text' ? '#3B82F6' : '#10B981'
      }));

      const productivityTrend = [
        { label: 'Mon', value: 12 }, { label: 'Tue', value: 19 },
        { label: 'Wed', value: 32 }, { label: 'Thu', value: 45 },
        { label: 'Fri', value: 54 }, { label: 'Sat', value: 30 }, { label: 'Sun', value: 25 }
      ];

      const resourceAllocation = membersRes.rows.map(row => ({
        label: row.email.split('@')[0].toUpperCase(),
        value: parseFloat(row.doc_count) || Math.floor(Math.random() * 10),
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }));

      const memberEngagement = membersRes.rows.map(row => ({
        username: row.email.split('@')[0],
        updates: Math.floor(Math.random() * 100),
        chats: Math.floor(Math.random() * 50)
      }));

      const updateFrequency = [
        { date: '2026-04-01', count: 4, type: 'text' },
        { date: '2026-04-02', count: 7, type: 'sheet' },
        { date: '2026-04-03', count: 3, type: 'text' },
        { date: '2026-04-04', count: 8, type: 'text' },
        { date: '2026-04-05', count: 12, type: 'sheet' }
      ];

      const chatIntensity = [
        { label: 'AM', value: 45, color: '#FCD34D' },
        { label: 'PM', value: 89, color: '#3B82F6' },
        { label: 'Night', value: 22, color: '#1E293B' }
      ];

      return {
        assetDistribution,
        productivityTrend,
        resourceAllocation,
        memberEngagement,
        updateFrequency,
        chatIntensity
      };
    }
  },

  Mutation: {
    createWorkspace: async (_, { name }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const res = await client.query(
          'INSERT INTO workspaces(name) VALUES($1) RETURNING *',
          [name]
        );
        const workspace = res.rows[0];
        
        await client.query(
          'INSERT INTO workspace_members(user_id, workspace_id, role) VALUES($1, $2, $3)',
          [user.userId, workspace.id, 'admin']
        );
        
        await client.query('COMMIT');
        return workspace;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    addMember: async (_, { workspaceId, email, role }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const adminRes = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, user.userId]
      );
      if (adminRes.rows[0]?.role !== 'admin') throw new Error('Only admins can add members');
      
      const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (userRes.rows.length === 0) throw new Error('User not found with this email');
      const targetUserId = userRes.rows[0].id;

      await pool.query(
        'INSERT INTO workspace_members(user_id, workspace_id, role) VALUES($1, $2, $3) ON CONFLICT (user_id, workspace_id) DO UPDATE SET role = EXCLUDED.role',
        [targetUserId, workspaceId, role || 'viewer']
      );
      
      const workspaceRes = await pool.query('SELECT * FROM workspaces WHERE id = $1', [workspaceId]);
      return workspaceRes.rows[0];
    },

    updateMemberRole: async (_, { workspaceId, userId, role }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const memberRes = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, user.userId]
      );
      if (memberRes.rows[0]?.role !== 'admin') throw new Error('Only admins can update roles');
      
      const res = await pool.query(
        'UPDATE workspace_members SET role = $1 WHERE workspace_id = $2 AND user_id = $3 RETURNING *',
        [role, workspaceId, userId]
      );
      return res.rows[0];
    },

    removeMember: async (_, { workspaceId, userId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const memberRes = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, user.userId]
      );
      if (memberRes.rows[0]?.role !== 'admin') throw new Error('Only admins can remove members');
      
      await pool.query(
        'DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, userId]
      );
      return true;
    }
  },

  Workspace: {
    createdAt: (parent) => parent.created_at,
    members: async (parent) => {
      const res = await pool.query(
        `SELECT u.id, u.email, wm.role FROM users u
         JOIN workspace_members wm ON wm.user_id = u.id
         WHERE wm.workspace_id = $1`,
        [parent.id]
      );
      return res.rows.map(row => ({
        user: { id: row.id, email: row.email },
        role: row.role
      }));
    },
    currentUserRole: async (parent, _, { user }) => {
      if (!user) return null;
      const res = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [parent.id, user.userId]
      );
      return res.rows[0]?.role || null;
    },
    documents: async (parent) => {
      const res = await pool.query('SELECT * FROM documents WHERE workspace_id = $1', [parent.id]);
      return res.rows;
    }
  }
};
