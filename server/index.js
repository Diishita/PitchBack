import 'dotenv/config';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectToDatabase, createSessionStore } from './database.js';
import { attachRealtime } from './realtime.js';

const startServer = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendOrigins = (process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.SESSION_SECRET
    && Buffer.byteLength(process.env.SESSION_SECRET, 'utf8') < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 bytes.');
  }
  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required in production.');
  }
  if (isProduction && !frontendOrigins.length) {
    throw new Error('FRONTEND_ORIGINS is required in production.');
  }

  await connectToDatabase();
  if (!process.env.SESSION_SECRET) {
    console.warn('[API] SESSION_SECRET is unset; sessions will expire when the API restarts.');
  }

  const sessionStore = createSessionStore();
  const app = createApp({ sessionStore });
  const httpServer = createServer(app);
  const io = attachRealtime(httpServer, app.get('sessionMiddleware'), frontendOrigins);
  app.set('io', io);
  const port = Number(process.env.PORT || 5000);
  const host = process.env.API_HOST || (isProduction ? '0.0.0.0' : '127.0.0.1');
  httpServer.listen(port, host, () => {
    console.log(`[API] Listening at http://${host}:${port}`);
  });

  const shutdown = async () => {
    await new Promise((resolve) => io.close(resolve));
    await mongoose.disconnect();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

startServer().catch((error) => {
  console.error('[API] Could not start server:', error.message);
  process.exitCode = 1;
});
