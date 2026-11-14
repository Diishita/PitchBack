import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { createApp } from './app.js';

const createAdminIfConfigured = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email && !password) {
    if (!await User.exists({ role: 'admin' })) {
      console.warn('[API] No administrator exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create one.');
    }
    return;
  }
  if (!email || !password) {
    throw new Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD in .env to create the administrator account.');
  }
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters and no more than 72 UTF-8 bytes.');
  }
  if (await User.exists({ role: 'admin' })) return;
  if (await User.exists({ email })) {
    throw new Error('ADMIN_EMAIL already belongs to a non-administrator account.');
  }

  await User.create({
    _id: randomBytes(16).toString('hex'),
    username: 'Administrator',
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
  });
  console.log(`[API] Administrator account created for ${email}.`);
};

const startServer = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The API is configured for local development only.');
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure your database URI.');
  }
  if (process.env.SESSION_SECRET
    && Buffer.byteLength(process.env.SESSION_SECRET, 'utf8') < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 bytes.');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  await createAdminIfConfigured();
  if (!process.env.SESSION_SECRET) {
    console.warn('[API] SESSION_SECRET is unset; sessions will expire when the API restarts.');
  }

  const sessionStore = MongoStore.create({
    clientPromise: Promise.resolve(mongoose.connection.getClient()),
    collectionName: 'sessions',
    ttl: 8 * 60 * 60,
  });
  const app = createApp({ sessionStore });
  const port = Number(process.env.PORT || 5000);
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`[API] Listening at http://127.0.0.1:${port}`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

startServer().catch((error) => {
  console.error('[API] Could not start server:', error.message);
  process.exitCode = 1;
});
