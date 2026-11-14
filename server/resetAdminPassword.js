import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';

const resetAdminPassword = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!mongoUri) throw new Error('MONGODB_URI is required.');
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before resetting the password.');
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD must be no more than 72 UTF-8 bytes.');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  const admin = await User.findOne({ email, role: 'admin' }).select('+passwordHash');
  if (!admin) {
    throw new Error('No administrator matches ADMIN_EMAIL. Use the exact email shown during account creation.');
  }

  admin.passwordHash = await bcrypt.hash(password, 12);
  await admin.save();
  console.log(`[API] Administrator password reset for ${email}.`);
};

try {
  await resetAdminPassword();
} catch (error) {
  console.error('[API] Could not reset administrator password:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
