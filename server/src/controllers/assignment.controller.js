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

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    assignedTo: req.user.id,
    status: { $in: ['pending', 'processing'] },
  }).sort({ createdAt: -1 });
  res.json({ data: orders });
});

export const updateFulfillment = asyncHandler(async (req, res) => {
  const order = mongoose.isValidObjectId(req.params.id) ? await Order.findById(req.params.id) : null;
  if (!order) throw new ApiError(404, 'Order not found.');
  if (!order.assignedTo || order.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, 'You can only update orders assigned to you.');
  }
  if (!['pending', 'processing'].includes(order.status)) {
    throw new ApiError(422, 'This order is no longer active.');
  }

  const { fulfillmentStatus } = req.body;
  if (fulfillmentStatus === 'ready' && order.fulfillmentStatus !== 'preparing') {
    throw new ApiError(422, 'Only an order being prepared can be marked ready.');
  }
  if (fulfillmentStatus === 'served' && order.fulfillmentStatus !== 'ready') {
    throw new ApiError(422, 'Mark the order ready before marking it served.');
  }

  order.fulfillmentStatus = fulfillmentStatus;
  if (fulfillmentStatus === 'ready') order.readyAt = new Date();
  if (fulfillmentStatus === 'served') order.servedAt = new Date();
  await order.save();
  res.json({ order, message: `Order marked ${fulfillmentStatus}.` });
});

export const assign = asyncHandler(async (req, res) => {
  const { order: orderId, assignedTo, assignmentNotes } = req.body;
  const order = mongoose.isValidObjectId(orderId) ? await Order.findById(orderId) : null;
  if (!order) throw new ApiError(422, 'Selected order does not exist.', { order: 'Selected order does not exist.' });
  if (!['pending', 'processing'].includes(order.status)) {
    throw new ApiError(422, 'Only active orders can be assigned.');
  }
  const staff = mongoose.isValidObjectId(assignedTo) ? await User.findById(assignedTo) : null;
  if (!staff) throw new ApiError(422, 'Selected staff member does not exist.', { assignedTo: 'Selected staff member does not exist.' });

  order.assignedTo = staff.id;
  order.assignedStaffName = null;
  order.status = 'processing';
  order.fulfillmentStatus ||= 'preparing';
  order.assignmentNotes = assignmentNotes;
  order.assignedAt = new Date();
  await order.save();
  res.json({ message: `Order ${order.ordername} assigned to ${staff.name} successfully.` });
});
