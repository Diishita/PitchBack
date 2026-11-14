import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { toUserDto } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../validation.js';
import { validateBody } from '../middleware/validateBody.js';
import { notifyUsersChanged } from '../realtime.js';

const router = Router();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const sessionOperation = (session, operation) => new Promise((resolve, reject) => {
  session[operation]((error) => error ? reject(error) : resolve());
});

const startSession = async (req, user) => {
  await sessionOperation(req.session, 'regenerate');
  req.session.userId = user._id.toString();
  await sessionOperation(req.session, 'save');
};

router.post('/register', validateBody(registerSchema), asyncHandler(async (req, res) => {
  const { username, email, password, contactNumber, city } = req.validatedBody;
  if (await User.exists({ email })) {
    return res.status(409).json({
      error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists.' },
    });
  }

  const user = await User.create({
    _id: randomBytes(16).toString('hex'),
    username,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    contactNumber,
    city,
    role: 'user',
  });

  await startSession(req, user);
  notifyUsersChanged(req.app.get('io'));
  return res.status(201).json({ data: toUserDto(user) });
}));

router.post('/login', validateBody(loginSchema), asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.validatedBody.email }).select('+passwordHash');
  const passwordMatches = user
    ? await bcrypt.compare(req.validatedBody.password, user.passwordHash)
    : false;

  if (!passwordMatches) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
    });
  }
  if (user.isBlocked) {
    return res.status(403).json({
      error: { code: 'ACCOUNT_BLOCKED', message: 'This account has been blocked.' },
    });
  }

  await startSession(req, user);
  return res.json({ data: toUserDto(user) });
}));

router.get('/me', asyncHandler(async (req, res) => {
  const user = req.session.userId
    ? await User.findById(req.session.userId)
    : null;
  if (!user || user.isBlocked) {
    if (req.session.userId) await sessionOperation(req.session, 'destroy');
    res.clearCookie('pitchback.sid');
    return res.json({ data: null });
  }
  return res.json({ data: toUserDto(user) });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const userId = req.session?.userId;
  if (userId) req.app.get('io')?.in(`user:${userId}`).disconnectSockets(true);
  if (req.session) await sessionOperation(req.session, 'destroy');
  res.clearCookie('pitchback.sid');
  return res.json({ data: { loggedOut: true } });
}));

export default router;
