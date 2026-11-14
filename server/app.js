import express from 'express';
import mongoose from 'mongoose';
import matchRoutes from './routes/matches.js';
import enrollmentRoutes from './routes/enrollments.js';

const app = express();

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    data: {
      status: connected ? 'ok' : 'unavailable',
      database: connected ? 'connected' : 'disconnected',
    },
  });
});

app.use('/api/matches', matchRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.use((req, _res, next) => {
  next(Object.assign(new Error(`Route not found: ${req.method} ${req.path}`), {
    statusCode: 404,
    code: 'NOT_FOUND',
  }));
});

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);

  const statusCode = error.statusCode
    || error.status
    || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  const message = statusCode >= 500 ? 'An unexpected server error occurred.' : error.message;

  if (statusCode >= 500) {
    console.error('[API] Request failed', error);
  }

  res.status(statusCode).json({
    error: {
      code: error.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'),
      message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
});

export default app;
