import mongoose from 'mongoose';
import StaffShift from '../models/StaffShift.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate } from '../utils/paginate.js';

const POPULATE = { path: 'user', select: 'name role' };

const findOr404 = async (id) => {
  const shift = mongoose.isValidObjectId(id) ? await StaffShift.findById(id).populate(POPULATE) : null;
  if (!shift) throw new ApiError(404, 'Staff shift not found.');
  return shift;
};

async function assertUser(id) {
  if (!mongoose.isValidObjectId(id) || !(await User.exists({ _id: id }))) {
    throw new ApiError(422, 'Selected staff member does not exist.', { user: 'Selected staff member does not exist.' });
  }
}

export const list = asyncHandler(async (req, res) => {
  res.json(await paginate(StaffShift, {}, req, { sort: { shiftDate: -1, startTime: 1 }, populate: POPULATE }));
});

// edit form ke liye user ko plain id me chahiye
export const getOne = asyncHandler(async (req, res) => {
  const shift = await findOr404(req.params.id);
  res.json({ staffShift: { ...shift.toJSON(), user: shift.user?.id || null } });
});

export const create = asyncHandler(async (req, res) => {
  await assertUser(req.body.user);
  const shift = await StaffShift.create(req.body);
  res.status(201).json({ staffShift: await shift.populate(POPULATE), message: 'Staff shift scheduled successfully.' });
});

export const update = asyncHandler(async (req, res) => {
  const shift = await findOr404(req.params.id);
  await assertUser(req.body.user);
  shift.set(req.body);
  await shift.save();
  await shift.populate(POPULATE);
  res.json({ staffShift: shift, message: 'Staff shift updated successfully.' });
});

export const remove = asyncHandler(async (req, res) => {
  const shift = await findOr404(req.params.id);
  await shift.deleteOne();
  res.json({ message: 'Staff shift deleted successfully.' });
});
