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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  contactNumber: {
    type: String,
    trim: true,
    maxlength: 25,
    default: '',
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100,
    default: '',
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

export const User = mongoose.models.User || mongoose.model('User', userSchema);
