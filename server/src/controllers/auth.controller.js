import crypto from 'crypto';
import User from '../models/User.js';
import Order from '../models/Order.js';
import StaffShift from '../models/StaffShift.js';
import { signToken } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';

const authResponse = (user) => ({ token: signToken(user), user });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw new ApiError(422, 'This email is already registered.', { email: 'This email is already registered.' });
  const user = await User.create({ name, email, password });
  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(422, 'These credentials do not match our records.', { email: 'These credentials do not match our records.' });
  }
  res.json(authResponse(user));
});

export const me = asyncHandler(async (req, res) => res.json({ user: req.user }));

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 ghanta
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    const link = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Reset your Cafe Express password',
      text: `Password reset link (1 ghante tak valid): ${link}`,
      html: `<p>Password reset karne ke liye click karo (1 ghante tak valid):</p><p><a href="${link}">${link}</a></p>`,
    });
  }
  // email exist karta hai ya nahi - reveal nahi karte
  res.json({ message: 'If that email exists, we have sent a password reset link.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ email, resetTokenHash: hash, resetTokenExpires: { $gt: new Date() } }).select('+resetTokenHash +resetTokenExpires');
  if (!user) throw new ApiError(422, 'This password reset link is invalid or expired.', { email: 'This password reset link is invalid or expired.' });

  user.password = password;
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ message: 'Your password has been reset. Please login.' });
});

// ---------- profile ----------
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (email !== req.user.email && (await User.exists({ email, _id: { $ne: req.user.id } }))) {
    throw new ApiError(422, 'This email is already taken.', { email: 'This email is already taken.' });
  }
  req.user.name = name;
  req.user.email = email;
  await req.user.save();
  res.json({ user: req.user, message: 'Profile updated.' });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new ApiError(422, 'The current password is incorrect.', { currentPassword: 'The current password is incorrect.' });
  }
  user.password = req.body.password;
  await user.save();
  res.json({ message: 'Password updated.' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.password))) {
    throw new ApiError(422, 'The password is incorrect.', { password: 'The password is incorrect.' });
  }
  await cleanupUser(user.id);
  res.json({ message: 'Account deleted.' });
});

// user delete hone par: orders se assignment hatao, shifts delete karo
export async function cleanupUser(userId) {
  await Order.updateMany({ assignedTo: userId }, { $set: { assignedTo: null } });
  await StaffShift.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);
}
