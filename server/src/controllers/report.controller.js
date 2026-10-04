import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reports = asyncHandler(async (_req, res) => {
  const completed = { status: 'completed' };

  const [summaryAgg, pendingOrders, statusBreakdown, topItems, topCustomers, recentSalesDesc] = await Promise.all([
    Order.aggregate([
      { $match: completed },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, completedOrders: { $sum: 1 }, averageOrderValue: { $avg: '$amount' } } },
    ]),
    Order.countDocuments({ status: { $in: ['pending', 'processing'] } }),
    Order.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.item', name: { $last: '$items.itemName' }, totalQuantity: { $sum: '$items.quantity' }, totalSales: { $sum: '$items.lineTotal' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: completed },
      { $group: { _id: '$customerno', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$amount' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: completed },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, ordersCount: { $sum: 1 }, dailyRevenue: { $sum: '$amount' } } },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]),
  ]);

  const s = summaryAgg[0] || {};
  res.json({
    salesSummary: {
      totalRevenue: s.totalRevenue || 0,
      completedOrders: s.completedOrders || 0,
      averageOrderValue: s.averageOrderValue || 0,
      pendingOrders,
    },
    statusBreakdown: statusBreakdown.map((x) => ({ status: x._id, total: x.total })),
    topItems: topItems.map((x) => ({ itemId: x._id, name: x.name, totalQuantity: x.totalQuantity, totalSales: x.totalSales })),
    topCustomers: topCustomers.map((x) => ({ customerno: x._id, totalOrders: x.totalOrders, totalSpent: x.totalSpent })),
    recentSales: recentSalesDesc.reverse().map((x) => ({ saleDate: x._id, ordersCount: x.ordersCount, dailyRevenue: x.dailyRevenue })),
  });
});
