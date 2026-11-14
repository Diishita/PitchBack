import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

userSchema.index({ username: 1, contactNumber: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
