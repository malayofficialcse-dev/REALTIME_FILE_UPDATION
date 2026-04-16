import { pool } from '../../config/db.js';
import { pubsub } from '../../utils/pubsub.js';

export const notificationResolver = {
  Query: {
    myNotifications: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const res = await pool.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
        [user.userId]
      );
      return res.rows;
    }
  },
  Mutation: {
    sendInvite: async (_, { email, workspaceId, role }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const adminRes = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, user.userId]
      );
      if (adminRes.rows[0]?.role !== 'admin') throw new Error('Only admins can invite members');
      
      const targetUser = await pool.query('SELECT id, email FROM users WHERE email = $1', [email.toLowerCase()]);
      if (targetUser.rows.length === 0) throw new Error('User not found');
      const targetUserId = targetUser.rows[0].id;
      
      const memberCheck = await pool.query(
        'SELECT id FROM workspace_members WHERE user_id = $1 AND workspace_id = $2',
        [targetUserId, workspaceId]
      );
      if (memberCheck.rows.length > 0) throw new Error('User is already a member');
      
      const message = `You have been invited to join a workspace as ${role}.`;

      const result = await pool.query(
        `INSERT INTO notifications(user_id, sender_id, workspace_id, type, status, message) 
         VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
        [targetUserId, user.userId, workspaceId, 'INVITATION', 'unread', message]
      );
      
      const notification = result.rows[0];
      pubsub.publish('NOTIFICATION_ADDED', { notificationAdded: notification });
      
      return notification;
    },
    
    respondInvite: async (_, { notificationId, accept }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const notifRes = await pool.query('SELECT * FROM notifications WHERE id = $1 AND user_id = $2', [notificationId, user.userId]);
      if (notifRes.rows.length === 0) throw new Error('Notification not found');
      
      const notification = notifRes.rows[0];
      if (notification.type !== 'INVITATION') throw new Error('Not an invitation');
      
      await pool.query('UPDATE notifications SET status = $1 WHERE id = $2', [accept ? 'ACCEPTED' : 'DECLINED', notificationId]);
      
      if (accept && notification.workspace_id) {
        await pool.query(
          `INSERT INTO workspace_members(user_id, workspace_id, role) 
           VALUES($1, $2, $3) 
           ON CONFLICT (user_id, workspace_id) DO UPDATE SET role = EXCLUDED.role`,
          [user.userId, notification.workspace_id, 'editor']
        );
        
        const senderMessage = `${user.email} accepted your invitation.`;
        const senderNotif = await pool.query(
          `INSERT INTO notifications(user_id, sender_id, workspace_id, type, status, message) 
           VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
          [notification.sender_id, user.userId, notification.workspace_id, 'INVITE_ACCEPTED', 'unread', senderMessage]
        );
        pubsub.publish('NOTIFICATION_ADDED', { notificationAdded: senderNotif.rows[0] });
      }
      
      return true;
    },

    markAsRead: async (_, { notificationId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      await pool.query('UPDATE notifications SET status = $1 WHERE id = $2 AND user_id = $3', ['read', notificationId, user.userId]);
      return true;
    },

    markAllAsRead: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      await pool.query('UPDATE notifications SET status = $1 WHERE user_id = $2', ['read', user.userId]);
      return true;
    }
  },
  Subscription: {
    notificationAdded: {
      subscribe: () => pubsub.asyncIterator(['NOTIFICATION_ADDED'])
    }
  },
  Notification: {
    userId: (parent) => parent.user_id,
    senderId: (parent) => parent.sender_id,
    workspaceId: (parent) => parent.workspace_id,
    createdAt: (parent) => parent.created_at ? parent.created_at.toISOString() : new Date().toISOString(),
    
    sender: async (parent) => {
      if (!parent.sender_id) return null;
      const res = await pool.query('SELECT id, email FROM users WHERE id = $1', [parent.sender_id]);
      return res.rows[0];
    },
    workspace: async (parent) => {
      if (!parent.workspace_id) return null;
      const res = await pool.query('SELECT * FROM workspaces WHERE id = $1', [parent.workspace_id]);
      return res.rows[0];
    }
  }
};
