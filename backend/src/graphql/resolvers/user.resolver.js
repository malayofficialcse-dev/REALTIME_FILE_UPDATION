import {pool} from '../../config/db.js';

export const userResolver = {
    Query: {
        users: async () => {
            const res = await pool.query('SELECT id,email FROM users');
        }
    }
};