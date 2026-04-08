import {pool} from '../../config/db.js';

export const workspaceResolver = {
    Query: {
        workspace: async (_,__,{user}) => {
            const res = await pool.query(
                `SELECT w.* FROM workspaces w JOIN workspace_members wm ON wm.workspace_id=w.id
                WHERE wm.user_id=$1`,
                [user.userId]
            );
            return res.rows;
        }
    },

    Mutation: {
        createWorkspace: async (_,{name},{user}) => {
            const res = await pool.query(
                'INSERT INTO workspaces(name) VALUES ($1) RETURNING *',
                [name]
            );

            await pool.query(
                'INSERT INTO workspace_member(user_id,workspace_id,role) VALUES ($1,$2,$3)',
                [user.userId,res.rows[0].id,'OWNER']
            );
            return res.rows[0];
        }
    }
};

