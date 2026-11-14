import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

export const createAdminIfConfigured = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email && !password) {
    if (!await User.exists({ role: 'admin' })) {
      console.warn('[API] No administrator exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create one.');
    }
    return;
  }
  if (!email || !password) {
    throw new Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD in .env to create the administrator account.');
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD must be no more than 72 UTF-8 bytes.');
  }
  if (await User.exists({ role: 'admin' })) return;
  if (await User.exists({ email })) {
    throw new Error('ADMIN_EMAIL already belongs to a non-administrator account.');
  }

  await User.create({
    _id: randomBytes(16).toString('hex'),
    username: 'Administrator',
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
  });
  console.log(`[API] Administrator account created for ${email}.`);
};
