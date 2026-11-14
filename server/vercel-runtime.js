import { createAdapter } from '@socket.io/mongo-adapter';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectToDatabase, createSessionStore } from './database.js';
import { attachRealtime, createRealtimePublisher } from './realtime.js';

let adapterPromise;

const getFrontendOrigins = () => {
  const configuredOrigins = (process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const vercelHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .filter(Boolean)
    .map((host) => `https://${host.replace(/^https?:\/\//, '')}`);
  const origins = [...new Set([...configuredOrigins, ...vercelHosts])];

  if (!origins.length) {
    throw new Error('Set FRONTEND_ORIGINS or enable Vercel system environment variables.');
  }

  return origins;
};

const getMongoAdapter = async () => {
  await connectToDatabase();
  if (!adapterPromise) {
    const collection = mongoose.connection.db.collection('socket.io-adapter-events');
    adapterPromise = collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 3600 },
    ).then(() => createAdapter(collection, { addCreatedAtField: true }))
      .catch((error) => {
        adapterPromise = undefined;
        throw error;
      });
  }
  return adapterPromise;
};

const validateSessionSecret = () => {
  if (!process.env.SESSION_SECRET
    || Buffer.byteLength(process.env.SESSION_SECRET, 'utf8') < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 bytes.');
  }
};

export const createVercelApiApp = async () => {
  validateSessionSecret();
  const allowedOrigins = getFrontendOrigins();
  await connectToDatabase();
  const adapter = await getMongoAdapter();
  const app = createApp({
    sessionStore: createSessionStore(),
    allowedOrigins,
  });
  app.set('io', createRealtimePublisher(adapter));
  return app;
};

export const createVercelSocketServer = async () => {
  validateSessionSecret();
  const allowedOrigins = getFrontendOrigins();
  await connectToDatabase();
  const adapter = await getMongoAdapter();
  const app = createApp({
    sessionStore: createSessionStore(),
    allowedOrigins,
  });
  const server = createServer(app);
  attachRealtime(server, app.get('sessionMiddleware'), allowedOrigins, adapter);
  return server;
};
