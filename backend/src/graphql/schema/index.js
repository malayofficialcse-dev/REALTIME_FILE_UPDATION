import { gql } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseSchema = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
  type Subscription {
    _empty: String
  }
`;

const authSchema = readFileSync(join(__dirname, 'auth.gql'), 'utf8');
const userSchema = readFileSync(join(__dirname, 'user.gql'), 'utf8');
const workspaceSchema = readFileSync(join(__dirname, 'workspace.gql'), 'utf8');
const documentSchema = readFileSync(join(__dirname, 'document.gql'), 'utf8');
const commentSchema = readFileSync(join(__dirname, 'comment.gql'), 'utf8');
const notificationSchema = readFileSync(join(__dirname, 'notification.gql'), 'utf8');
const taskSchema = readFileSync(join(__dirname, 'task.gql'), 'utf8');

export const typeDefs = [
  baseSchema,
  gql(authSchema),
  gql(userSchema),
  gql(workspaceSchema),
  gql(documentSchema),
  gql(commentSchema),
  gql(notificationSchema),
  gql(taskSchema)
];
