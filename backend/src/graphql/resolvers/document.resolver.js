// document.resolver.js
import { updateDocService } from '../../services/document.service.js';
import { pool } from '../../config/db.js';
import { pubsub } from '../../utils/pubsub.js';

export const documentResolver = {
  Query: {
    documents: async (_, __, { user }) => {
      const res = await pool.query(
        `SELECT d.* FROM documents d
         JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
         WHERE wm.user_id=$1`,
        [user.userId]
      );
      return res.rows;
    }
  },

  Mutation: {
    createDocument: async (_, { title, workspaceId }) => {
      const res = await pool.query(
        'INSERT INTO documents(title, content, workspace_id) VALUES($1,$2,$3) RETURNING *',
        [title, '', workspaceId]
      );
      return res.rows[0];
    },

    updateDocument: async (_, { id, content }) => {
      const doc = await updateDocService(id, content);

      pubsub.publish('DOC_UPDATED', {
        documentUpdated: doc
      });

      return doc;
    }
  },

  Subscription: {
    documentUpdated: {
      subscribe: () => pubsub.asyncIterator(['DOC_UPDATED'])
    }
  }
};
