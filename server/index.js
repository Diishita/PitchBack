import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const startServer = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The Phase 2 API is local-development only until Phase 3 authentication is complete.');
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure your database URI.');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

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
