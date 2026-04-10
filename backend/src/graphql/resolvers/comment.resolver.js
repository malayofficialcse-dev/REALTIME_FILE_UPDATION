import { pool } from '../../config/db.js';

export const commentResolver = {
  Query: {
    comments: async (_, { documentId, cellRow, cellCol }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      let query = 'SELECT * FROM comments WHERE document_id = $1';
      let params = [documentId];

      if (cellRow !== undefined && cellCol !== undefined) {
        query += ' AND cell_row = $2 AND cell_col = $3 AND parent_id IS NULL';
        params.push(cellRow, cellCol);
      } else {
        query += ' AND parent_id IS NULL';
      }

      query += ' ORDER BY created_at ASC';
      const res = await pool.query(query, params);
      return res.rows;
    }
  },

  Mutation: {
    addComment: async (_, { documentId, text, cellRow, cellCol, charOffset, parentId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query(
        'INSERT INTO comments(document_id, user_id, text, cell_row, cell_col, char_offset, parent_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [documentId, user.userId, text, cellRow, cellCol, charOffset, parentId]
      );
      return res.rows[0];
    }
  },

  Comment: {
    user: async (parent) => {
      const res = await pool.query('SELECT id, email FROM users WHERE id = $1', [parent.user_id]);
      return res.rows[0];
    },
    cellRow: (parent) => parent.cell_row,
    cellCol: (parent) => parent.cell_col,
    charOffset: (parent) => parent.char_offset,
    parentId: (parent) => parent.parent_id,
    replies: async (parent) => {
      const res = await pool.query(
        'SELECT * FROM comments WHERE parent_id = $1 ORDER BY created_at ASC',
        [parent.id]
      );
      return res.rows;
    },
    createdAt: (parent) => parent.created_at.toISOString()
  }
};
