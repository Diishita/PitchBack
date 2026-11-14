import { Router } from 'express';
import { Enrollment } from '../models/Enrollment.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { requireAdmin, requireAuth, toUserDto } from '../middleware/auth.js';
import { blockUserSchema } from '../validation.js';
import { validateBody } from '../middleware/validateBody.js';
import { notifyEnrollmentsChanged, notifyUsersChanged } from '../realtime.js';
import { notifyAdmins, notifyRecipient } from '../notifications.js';

const router = Router();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(async (_req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.json({ data: users.map(toUserDto) });
}));

router.patch('/:id/block', validateBody(blockUserSchema), asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'user' },
    { isBlocked: req.validatedBody.isBlocked },
    { new: true, runValidators: true },
  );
  if (!user) {
    return next(Object.assign(new Error('User not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }
  if (user.isBlocked) {
    req.app.get('io')?.in(`user:${user._id.toString()}`).disconnectSockets(true);
  }
  notifyUsersChanged(req.app.get('io'));
  await notifyRecipient(req.app.get('io'), user._id, {
    type: 'account',
    title: user.isBlocked ? 'Account access changed' : 'Account access restored',
    message: user.isBlocked
      ? 'Your account access has been restricted. Contact an administrator for help.'
      : 'Your account access has been restored.',
  });
  return res.json({ data: toUserDto(user) });
}));

router.delete('/:id', asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(Object.assign(new Error('You cannot delete the active administrator account.'), {
      statusCode: 400,
      code: 'CANNOT_DELETE_SELF',
    }));
  }

  const user = await User.findOneAndDelete({ _id: req.params.id, role: 'user' });
  if (!user) {
    return next(Object.assign(new Error('User not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  await Enrollment.deleteMany({ userId: user._id });
  await Notification.deleteMany({ recipientId: user._id });
  req.app.get('io')?.in(`user:${user._id.toString()}`).disconnectSockets(true);
  notifyUsersChanged(req.app.get('io'));
  notifyEnrollmentsChanged(req.app.get('io'));
  await notifyAdmins(req.app.get('io'), {
    type: 'account',
    title: 'Player account removed',
    message: 'A player account and its enrollments were removed.',
  });
  return res.json({ data: { id: user._id.toString(), deleted: true } });
}));

export default router;
