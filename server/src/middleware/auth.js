import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please login first.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'User not found. Please login again.');
  req.user = user;
  next();
});

export function requireAdmin(req, _res, next) {
  if (req.user.role !== 'admin') return next(new ApiError(403, 'Only an admin can manage staff assignments and approve order completion.'));
  next();
}

export function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
