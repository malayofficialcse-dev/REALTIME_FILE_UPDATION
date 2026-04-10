import { pool } from '../../config/db.js';

export const taskResolver = {
    Query: {
        getTasks: async (_, { workspaceId }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            const res = await pool.query(
                `SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC`,
                [workspaceId]
            );
            return res.rows;
        },
        getTask: async (_, { id }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
            return res.rows[0];
        }
    },

    Mutation: {
        createTask: async (_, { workspaceId, title, status, priority, assigneeId }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            const res = await pool.query(
                `INSERT INTO tasks (workspace_id, title, status, priority, assignee_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [workspaceId, title, status || 'TODO', priority || 'MEDIUM', assigneeId]
            );
            return res.rows[0];
        },
        updateTask: async (_, { id, title, description, status, priority, assigneeId }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            
            // Build dyamic update query
            const updates = [];
            const values = [];
            let i = 1;

            if (title !== undefined) { updates.push(`title = $${i++}`); values.push(title); }
            if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }
            if (status !== undefined) { updates.push(`status = $${i++}`); values.push(status); }
            if (priority !== undefined) { updates.push(`priority = $${i++}`); values.push(priority); }
            if (assigneeId !== undefined) { updates.push(`assignee_id = $${i++}`); values.push(assigneeId); }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            
            if (updates.length === 0) {
                const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
                return res.rows[0];
            }

            values.push(id);
            const res = await pool.query(
                `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
                values
            );
            return res.rows[0];
        },
        deleteTask: async (_, { id }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
            return true;
        }
    },

    Task: {
        workspace: async (parent) => {
            const res = await pool.query('SELECT * FROM workspaces WHERE id = $1', [parent.workspace_id]);
            return res.rows[0];
        },
        assignee: async (parent) => {
            if (!parent.assignee_id) return null;
            const res = await pool.query('SELECT id, email FROM users WHERE id = $1', [parent.assignee_id]);
            return res.rows[0];
        },
        createdAt: (parent) => parent.created_at,
        updatedAt: (parent) => parent.updated_at
    }
};
