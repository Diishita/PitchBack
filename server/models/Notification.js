import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['match', 'enrollment', 'account', 'suggestion'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 240,
  },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification
  || mongoose.model('Notification', notificationSchema);
