import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const isUnassigned = (o) => !o.assignedTo && !o.assignedStaffName;

export const overview = asyncHandler(async (_req, res) => {
  const [staffMembers, orders] = await Promise.all([
    User.find().sort({ name: 1 }),
    Order.find({ status: { $in: ['pending', 'processing'] } }).populate('assignedTo', 'name').sort({ createdAt: -1 }),
  ]);

  orders.sort((a, b) => Number(!isUnassigned(a)) - Number(!isUnassigned(b))); // unassigned upar

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const stats = {
    activeOrders: orders.length,
    unassignedOrders: orders.filter(isUnassigned).length,
    assignedToday: orders.filter((o) => !isUnassigned(o) && o.assignedAt && o.assignedAt >= today).length,
  };
  res.json({ staffMembers, orders, stats });
});

export const assign = asyncHandler(async (req, res) => {
  const { order: orderId, assignedTo, status, assignmentNotes } = req.body;
  const order = mongoose.isValidObjectId(orderId) ? await Order.findById(orderId) : null;
  if (!order) throw new ApiError(422, 'Selected order does not exist.', { order: 'Selected order does not exist.' });
  const staff = mongoose.isValidObjectId(assignedTo) ? await User.findById(assignedTo) : null;
  if (!staff) throw new ApiError(422, 'Selected staff member does not exist.', { assignedTo: 'Selected staff member does not exist.' });

  order.assignedTo = staff.id;
  order.assignedStaffName = null;
  order.status = status;
  order.assignmentNotes = assignmentNotes;
  order.assignedAt = new Date();
  await order.save();
  res.json({ message: `Order ${order.ordername} assigned to ${staff.name} successfully.` });
});
