import { updateDocService } from '../../services/document.service.js';
import { pool } from '../../config/db.js';
import { pubsub } from '../../utils/pubsub.js';
import { withFilter } from 'graphql-subscriptions';

const presenceStore = new Map();

export const documentResolver = {
  Query: {
    documents: async (_, { workspaceId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query(
        `SELECT d.* FROM documents d
         JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
         WHERE wm.user_id=$1 AND d.workspace_id=$2`,
        [user.userId, workspaceId]
      );
      return res.rows;
    },
    document: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
      return res.rows[0];
    },
    activeUsers: (_, { documentId }) => {
      const all = Array.from(presenceStore.values());
      return all.filter(p => String(p.documentId) === String(documentId) && (Date.now() - p.lastTimestamp < 10000));
    },
    documentVersions: async (_, { documentId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query(
        'SELECT * FROM document_versions WHERE document_id = $1 ORDER BY created_at DESC',
        [documentId]
      );
      return res.rows.map(row => ({
        ...row,
        createdAt: row.created_at.toISOString()
      }));
    },
    messages: async (_, { documentId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query(
        'SELECT * FROM messages WHERE document_id = $1 ORDER BY created_at ASC',
        [documentId]
      );
      return res.rows;
    }
  },

  Mutation: {
    createDocument: async (_, { title, workspaceId, type }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const memberRes = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, user.userId]
      );
      const role = memberRes.rows[0]?.role;
      if (!role || role === 'viewer') throw new Error('Viewers cannot create documents');

      const res = await pool.query(
        'INSERT INTO documents(title, content, workspace_id, owner_id, type) VALUES($1,$2,$3,$4,$5) RETURNING *',
        [title, '', workspaceId, user.userId, type || 'text']
      );
      return res.rows[0];
    },

    updateDocument: async (_, { id, content, title, config }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const docRes = await pool.query('SELECT workspace_id FROM documents WHERE id = $1', [id]);
      const workspaceId = docRes.rows[0]?.workspace_id;

      const memberRes = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, user.userId]
      );
      const role = memberRes.rows[0]?.role;
      if (role === 'viewer') throw new Error('Viewers cannot edit documents');

      let doc;
      if (content !== undefined || config !== undefined) {
        doc = await updateDocService(id, content, config);
        if (title) {
          const res = await pool.query('UPDATE documents SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
          doc = res.rows[0];
        }
      } else if (title) {
        const res = await pool.query('UPDATE documents SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
        doc = res.rows[0];
      } else {
        throw new Error('Either content, title, or config must be provided');
      }

      pubsub.publish('DOC_UPDATED', {
        documentUpdated: doc
      });

      return doc;
    },

    restoreVersion: async (_, { documentId, versionId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const versionRes = await pool.query('SELECT content FROM document_versions WHERE id = $1', [versionId]);
      if (versionRes.rows.length === 0) throw new Error('Version not found');
      const content = versionRes.rows[0].content;

      const res = await pool.query(
        'UPDATE documents SET content = $1 WHERE id = $2 RETURNING *',
        [content, documentId]
      );
      const doc = res.rows[0];

      await pool.query('INSERT INTO document_versions(document_id, content) VALUES($1, $2)', [documentId, content]);

      pubsub.publish('DOC_UPDATED', {
        documentUpdated: doc
      });

      return doc;
    },

    deleteDocument: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const docRes = await pool.query('SELECT workspace_id FROM documents WHERE id = $1', [id]);
      const workspaceId = docRes.rows[0]?.workspace_id;
      if (!workspaceId) throw new Error('Document not found');

      const memberRes = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, user.userId]
      );
      const role = memberRes.rows[0]?.role;
      if (!role || role === 'viewer') throw new Error('You do not have permission to delete this document');

      // Delete versions first (FK constraint)
      await pool.query('DELETE FROM document_versions WHERE document_id = $1', [id]);
      await pool.query('DELETE FROM documents WHERE id = $1', [id]);
      return true;
    },

    updatePresence: async (_, { documentId, cursorOffset, cursorRow, cursorCol, cursorX, cursorY, isTyping }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [user.userId]);
      const email = userRes.rows[0].email;

      const presence = {
        userId: user.userId,
        email: email,
        documentId,
        cursorOffset,
        cursorRow,
        cursorCol,
        cursorX,
        cursorY,
        isTyping,
        lastActive: new Date().toISOString(),
        lastTimestamp: Date.now()
      };

      presenceStore.set(`${user.userId}-${documentId}`, presence);

      const activeInDoc = Array.from(presenceStore.values())
        .filter(p => String(p.documentId) === String(documentId) && (Date.now() - p.lastTimestamp < 10000));

      pubsub.publish('PRESENCE_CHANGED', {
        presenceChanged: activeInDoc,
        documentId
      });

      return presence;
    },
    sendMessage: async (_, { documentId, text }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const res = await pool.query(
        'INSERT INTO messages (document_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *',
        [documentId, user.userId, text]
      );
      
      const message = res.rows[0];
      
      pubsub.publish('MESSAGE_SENT', {
        messageSent: message,
        documentId
      });
      
      return message;
    }
  },

  Subscription: {
    documentUpdated: {
      subscribe: () => pubsub.asyncIterator(['DOC_UPDATED'])
    },
    presenceChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['PRESENCE_CHANGED']),
        (payload, variables) => {
          return String(payload.documentId) === String(variables.documentId);
        }
      )
    },
    messageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['MESSAGE_SENT']),
        (payload, variables) => {
          return String(payload.documentId) === String(variables.documentId);
        }
      )
    }
  },

  Document: {
    config: (parent) => {
      if (parent.config === null || parent.config === undefined) return "{}";
      return typeof parent.config === 'string' ? parent.config : JSON.stringify(parent.config);
    },
    workspace: async (parent) => {
      const res = await pool.query('SELECT * FROM workspaces WHERE id = $1', [parent.workspace_id]);
      return res.rows[0];
    },
    createdAt: (parent) => parent.created_at ? parent.created_at.toISOString() : new Date().toISOString(),
    updatedAt: (parent) => parent.updated_at ? parent.updated_at.toISOString() : new Date().toISOString()
  },
  Message: {
    sender: async (parent) => {
      const res = await pool.query('SELECT id, email FROM users WHERE id = $1', [parent.sender_id]);
      return res.rows[0];
    },
    createdAt: (parent) => {
      if (!parent.created_at) return new Date().toISOString();
      return typeof parent.created_at === 'string' ? parent.created_at : parent.created_at.toISOString();
    }
  }
};
