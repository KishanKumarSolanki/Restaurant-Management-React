import Customer from '../models/Customer.js';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const active = { status: { $in: ['pending', 'processing'] } };
  const [totalCustomers, totalItems, totalOrders, totalStaff, activeOrders, unassignedOrders, completedOrders, recentAssignments] =
    await Promise.all([
      Customer.countDocuments(),
      Item.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(active),
      Order.countDocuments({ ...active, assignedTo: null, assignedStaffName: null }),
      Order.countDocuments({ status: 'completed' }),
      Order.find({ $or: [{ assignedTo: { $ne: null } }, { assignedStaffName: { $ne: null } }] })
        .populate('assignedTo', 'name')
        .sort({ assignedAt: -1 })
        .limit(5),
    ]);

  res.json({ totalCustomers, totalItems, totalOrders, totalStaff, activeOrders, unassignedOrders, completedOrders, recentAssignments });
});
