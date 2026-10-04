import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import StaffShift from '../models/StaffShift.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate } from '../utils/paginate.js';
import { cleanupUser } from './auth.controller.js';

const findOr404 = async (id) => {
  const user = mongoose.isValidObjectId(id) ? await User.findById(id) : null;
  if (!user) throw new ApiError(404, 'Staff member not found.');
  return user;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

async function assertEmailFree(email, excludeId) {
  const filter = { email };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await User.exists(filter)) throw new ApiError(422, 'This email is already taken.', { email: 'This email is already taken.' });
}

export const list = asyncHandler(async (req, res) => {
  const result = await paginate(User, {}, req, { sort: { name: 1 } });
  if (req.query.all === 'true') return res.json(result);

  const ids = result.data.map((u) => u._id);
  const grp = (match, key) => [{ $match: match }, { $group: { _id: `$${key}`, c: { $sum: 1 } } }];
  const [orderCounts, shiftCounts, upcomingCounts] = await Promise.all([
    Order.aggregate(grp({ assignedTo: { $in: ids } }, 'assignedTo')),
    StaffShift.aggregate(grp({ user: { $in: ids } }, 'user')),
    StaffShift.aggregate(grp({ user: { $in: ids }, shiftDate: { $gte: startOfToday() } }, 'user')),
  ]);
  const toMap = (arr) => Object.fromEntries(arr.map((x) => [String(x._id), x.c]));
  const o = toMap(orderCounts), s = toMap(shiftCounts), u = toMap(upcomingCounts);

  result.data = result.data.map((user) => ({
    ...user.toJSON(),
    assignedOrdersCount: o[user.id] || 0,
    staffShiftsCount: s[user.id] || 0,
    upcomingShiftsCount: u[user.id] || 0,
  }));
  res.json(result);
});

export const getOne = asyncHandler(async (req, res) => res.json({ staffMember: await findOr404(req.params.id) }));

export const create = asyncHandler(async (req, res) => {
  const { passwordConfirmation, ...data } = req.body;
  await assertEmailFree(data.email);
  const staffMember = await User.create(data);
  res.status(201).json({ staffMember, message: 'Staff member created successfully.' });
});

export const update = asyncHandler(async (req, res) => {
  const staffMember = await findOr404(req.params.id);
  const { passwordConfirmation, ...data } = req.body;
  await assertEmailFree(data.email, staffMember.id);
  if (!data.password) delete data.password;
  staffMember.set(data);
  await staffMember.save();
  res.json({ staffMember, message: 'Staff member updated successfully.' });
});

export const remove = asyncHandler(async (req, res) => {
  const staffMember = await findOr404(req.params.id);
  if (staffMember.id === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account from here. Use Profile > Delete Account.');
  }
  await cleanupUser(staffMember.id);
  res.json({ message: 'Staff member deleted successfully.' });
});
