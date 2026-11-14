import { randomBytes } from 'node:crypto';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import enrollmentRoutes from './routes/enrollments.js';
import userRoutes from './routes/users.js';

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AUTH_RATE_LIMITED',
      message: 'Too many authentication attempts. Try again later.',
    },
  },
});

export const createApp = ({ sessionStore } = {}) => {
  const app = express();
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(session({
    name: 'pitchback.sid',
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }));

  app.get('/api/health', (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
      data: {
        status: connected ? 'ok' : 'unavailable',
        database: connected ? 'connected' : 'disconnected',
      },
    });
  });

  app.use('/api/auth', (req, res, next) => {
    if (req.method === 'POST' && ['/login', '/register'].includes(req.path)) {
      return authRateLimit(req, res, next);
    }
    return next();
  }, authRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/users', userRoutes);

  app.use((req, _res, next) => {
    next(Object.assign(new Error(`Route not found: ${req.method} ${req.path}`), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  });

  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);

    const statusCode = error.statusCode
      || (error.code === 11000 ? 409 : undefined)
      || error.status
      || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
    const message = statusCode >= 500 ? 'An unexpected server error occurred.' : error.message;

    if (statusCode >= 500) {
      console.error('[API] Request failed', error);
    }

    res.status(statusCode).json({
      error: {
        code: error.code === 11000 ? 'DUPLICATE_VALUE' : error.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'),
        message: error.code === 11000 ? 'This email is already registered.' : message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  });

  return app;
};

const app = createApp();

export default app;
