import { pool } from '../../config/db.js';
import { pubsub } from '../../utils/pubsub.js';

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
        },
        getTimeLogs: async (_, { workspaceId, taskId }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            let query = `
                SELECT tl.* FROM time_logs tl
                JOIN tasks t ON t.id = tl.task_id
                WHERE t.workspace_id = $1
            `;
            const params = [workspaceId];
            if (taskId) {
                query += ` AND tl.task_id = $2`;
                params.push(taskId);
            }
            query += ` ORDER BY tl.log_date DESC`;
            const res = await pool.query(query, params);
            return res.rows;
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
            const task = res.rows[0];

            if (assigneeId && assigneeId != user.userId) {
                const notif = await pool.query(
                    `INSERT INTO notifications (user_id, sender_id, workspace_id, type, status, message)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [assigneeId, user.userId, workspaceId, 'TASK_ASSIGNED', 'unread', `You were assigned to task: ${title}`]
                );
                pubsub.publish('NOTIFICATION_ADDED', { notificationAdded: notif.rows[0] });
            }

            return task;
        },
        updateTask: async (_, { id, title, description, status, priority, assigneeId }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            
            const prevRes = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
            const prevTask = prevRes.rows[0];

            const updates = [];
            const values = [];
            let i = 1;

            if (title !== undefined) { updates.push(`title = $${i++}`); values.push(title); }
            if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }
            if (status !== undefined) { updates.push(`status = $${i++}`); values.push(status); }
            if (priority !== undefined) { updates.push(`priority = $${i++}`); values.push(priority); }
            if (assigneeId !== undefined) { updates.push(`assignee_id = $${i++}`); values.push(assigneeId); }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            
            values.push(id);
            const res = await pool.query(
                `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
                values
            );
            const task = res.rows[0];

            // Notify on important changes
            if (assigneeId && assigneeId != prevTask.assignee_id && assigneeId != user.userId) {
                const notif = await pool.query(
                    `INSERT INTO notifications (user_id, sender_id, workspace_id, type, status, message)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [assigneeId, user.userId, task.workspace_id, 'TASK_ASSIGNED', 'unread', `You were assigned to task: ${task.title}`]
                );
                pubsub.publish('NOTIFICATION_ADDED', { notificationAdded: notif.rows[0] });
            }

            return task;
        },
        deleteTask: async (_, { id }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
            return true;
        },
        logTime: async (_, { taskId, durationMinutes, description, logDate }, { user }) => {
            if (!user) throw new Error('Not authenticated');
            const res = await pool.query(
                `INSERT INTO time_logs (task_id, user_id, duration_minutes, description, log_date)
                 VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
                 RETURNING *`,
                [taskId, user.userId, durationMinutes, description, logDate]
            );
            return res.rows[0];
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
        timeLogs: async (parent) => {
            const res = await pool.query('SELECT * FROM time_logs WHERE task_id = $1 ORDER BY log_date DESC', [parent.id]);
            return res.rows;
        },
        totalMinutesLogged: async (parent) => {
            const res = await pool.query('SELECT SUM(duration_minutes) as total FROM time_logs WHERE task_id = $1', [parent.id]);
            return parseInt(res.rows[0].total || 0);
        },
        createdAt: (parent) => parent.created_at,
        updatedAt: (parent) => parent.updated_at
    },

    TimeLog: {
        task: async (parent) => {
            const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [parent.task_id]);
            return res.rows[0];
        },
        user: async (parent) => {
            const res = await pool.query('SELECT id, email FROM users WHERE id = $1', [parent.user_id]);
            return res.rows[0];
        },
        durationMinutes: (parent) => parent.duration_minutes,
        logDate: (parent) => parent.log_date ? new Date(parent.log_date).toISOString() : null,
        createdAt: (parent) => parent.created_at
    }
};
