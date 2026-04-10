import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import dotenv from 'dotenv';

import { typeDefs } from './graphql/schema/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import { authMiddleware } from './middleware/auth.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const startServer = async () => {
  const app = express();
  app.use(cors());

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const httpServer = createServer(app);

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: (connectionParams) => {
        const token = connectionParams.authToken;
        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET');
            return { user: decoded };
          } catch (err) {
            console.error('Subscription Auth Error:', err.message);
          }
        }
        return { user: null };
      },
    },
    {
      server: httpServer,
      path: '/graphql',
    }
  );

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      if (req) {
        return authMiddleware(req);
      }
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});






