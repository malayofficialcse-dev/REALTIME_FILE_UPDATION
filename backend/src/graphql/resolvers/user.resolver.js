import { pool } from '../../config/db.js';

export const userResolver = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      const res = await pool.query('SELECT id, email FROM users WHERE id = $1', [user.userId]);
      return res.rows[0];
    }
  }
};