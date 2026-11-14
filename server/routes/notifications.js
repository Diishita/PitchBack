import { Router } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 });
  res.json({
    data: notifications.map((notification) => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
    })),
  });
}));

router.delete('/:id', asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(Object.assign(new Error('Notification ID is invalid.'), {
      statusCode: 400,
      code: 'INVALID_ID',
    }));
  }

  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipientId: req.user._id,
  });
  if (!notification) {
    return next(Object.assign(new Error('Notification not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  return res.json({ data: { id: notification._id.toString(), dismissed: true } });
}));

export default router;
