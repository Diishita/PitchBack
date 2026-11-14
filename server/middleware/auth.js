import { User } from '../models/User.js';

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const sendAuthError = (res, statusCode, code, message) => {
  res.status(statusCode).json({ error: { code, message } });
};

export const requireAuth = asyncHandler(async (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return sendAuthError(res, 401, 'AUTH_REQUIRED', 'Sign in to continue.');
  }

  const user = await User.findById(userId);
  if (!user || user.isBlocked) {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie('pitchback.sid');
      return sendAuthError(res, 401, 'AUTH_REQUIRED', 'Your session is no longer valid.');
    });
    return undefined;
  }

  req.user = user;
  return next();
});

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendAuthError(res, 403, 'ADMIN_REQUIRED', 'Administrator access is required.');
  }
  return next();
};

export const toUserDto = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  contactNumber: user.contactNumber,
  city: user.city,
  role: user.role,
  isBlocked: user.isBlocked,
  createdAt: user.createdAt,
});
