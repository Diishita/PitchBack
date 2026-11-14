import { Notification } from './models/Notification.js';
import { User } from './models/User.js';
import { notifyNotificationChanged } from './realtime.js';

export const createNotifications = async (io, recipientIds, details) => {
  const uniqueRecipientIds = [...new Set(recipientIds.map(String))];
  if (!uniqueRecipientIds.length) return;

  await Notification.insertMany(uniqueRecipientIds.map((recipientId) => ({
    ...details,
    recipientId,
  })));
  uniqueRecipientIds.forEach((recipientId) => notifyNotificationChanged(io, recipientId));
};

export const notifyRecipient = (io, recipientId, details) => (
  createNotifications(io, [recipientId], details)
);

export const notifyAllUsers = async (io, details) => {
  const users = await User.find({ role: 'user', isBlocked: false }).select('_id').lean();
  return createNotifications(io, users.map((user) => user._id), details);
};

export const notifyAdmins = async (io, details) => {
  const admins = await User.find({ role: 'admin', isBlocked: false }).select('_id').lean();
  return createNotifications(io, admins.map((admin) => admin._id), details);
};
