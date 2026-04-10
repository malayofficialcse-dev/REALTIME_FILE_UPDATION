import { authResolver } from './auth.resolver.js';
import { userResolver } from './user.resolver.js';
import { workspaceResolver } from './workspace.resolver.js';
import { documentResolver } from './document.resolver.js';
import { commentResolver } from './comment.resolver.js';
import { notificationResolver } from './notification.resolver.js';
import { taskResolver } from './task.resolver.js';

export const resolvers = {
  Query: {
    ...userResolver.Query,
    ...workspaceResolver.Query,
    ...documentResolver.Query,
    ...commentResolver.Query,
    ...notificationResolver.Query,
    ...taskResolver.Query
  },
  Mutation: {
    ...authResolver.Mutation,
    ...workspaceResolver.Mutation,
    ...documentResolver.Mutation,
    ...commentResolver.Mutation,
    ...notificationResolver.Mutation,
    ...taskResolver.Mutation
  },
  Subscription: {
    ...documentResolver.Subscription,
    ...notificationResolver.Subscription
  },
  Workspace: {
    ...workspaceResolver.Workspace
  },
  Comment: {
    ...commentResolver.Comment
  },
  Document: {
    ...documentResolver.Document
  },
  Notification: {
    ...notificationResolver.Notification
  },
  Task: {
    ...taskResolver.Task
  },
  Message: {
    ...documentResolver.Message
  }
};
