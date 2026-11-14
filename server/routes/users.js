import { Router } from 'express';
import { Enrollment } from '../models/Enrollment.js';
import { User } from '../models/User.js';
import { requireAdmin, requireAuth, toUserDto } from '../middleware/auth.js';
import { blockUserSchema } from '../validation.js';
import { validateBody } from '../middleware/validateBody.js';

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
  return res.json({ data: { id: user._id.toString(), deleted: true } });
}));

export default router;
