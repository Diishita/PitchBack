import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { createAdminIfConfigured } from './admin.js';

let connectionPromise;

export const connectToDatabase = async () => {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI is required. Configure it in the deployment environment.');
      }

      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
      await createAdminIfConfigured();
    })().catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
};

export const createSessionStore = () => MongoStore.create({
  clientPromise: Promise.resolve(mongoose.connection.getClient()),
  collectionName: 'sessions',
  ttl: 8 * 60 * 60,
});
