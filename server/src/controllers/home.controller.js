import Customer from '../models/Customer.js';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DAY = 86400000;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Home page ka data. Client apna timezone offset (minutes, Date#getTimezoneOffset) bhejta hai
 * taaki "aaj" server ke UTC ke hisaab se nahi, user ke local din ke hisaab se ginta jaye.
 */
export const home = asyncHandler(async (req, res) => {
  const offsetMin = Number.isFinite(+req.query.tzOffset) ? +req.query.tzOffset : 0;
  const shifted = Date.now() - offsetMin * 60000; // local wall-clock as if UTC
  const localMidnight = Math.floor(shifted / DAY) * DAY;
  const todayStart = new Date(localMidnight + offsetMin * 60000);
  const weekStart = new Date(todayStart.getTime() - 6 * DAY);
  const live = { status: { $ne: 'cancelled' } };

  const [todayAgg, activeOrders, unpaidAgg, recentOrders, topItems, weekAgg] = await Promise.all([
    Order.aggregate([
      { $match: { ...live, createdAt: { $gte: todayStart } } },
      { $group: { _id: null, orders: { $sum: 1 }, sales: { $sum: '$amount' } } },
    ]),
    Order.countDocuments({ status: { $in: ['pending', 'processing'] } }),
    Order.aggregate([
      { $match: { ...live, paidAt: null } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('assignedTo', 'name'),
    Order.aggregate([
      { $match: { ...live, createdAt: { $gte: weekStart } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.item', name: { $last: '$items.itemName' }, quantity: { $sum: '$items.quantity' }, sales: { $sum: '$items.lineTotal' } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: { ...live, createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: tzString(offsetMin) } },
          orders: { $sum: 1 },
          sales: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  // pichhle 7 din, khaali din 0 ke saath
  const byDay = new Map(weekAgg.map((d) => [d._id, d]));
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = new Date(localMidnight - (6 - i) * DAY).toISOString().slice(0, 10);
    const d = byDay.get(key);
    return { date: key, orders: d?.orders || 0, sales: d?.sales || 0 };
  });

  res.json({
    today: { orders: todayAgg[0]?.orders || 0, sales: todayAgg[0]?.sales || 0 },
    activeOrders,
    unpaid: { count: unpaidAgg[0]?.count || 0, amount: unpaidAgg[0]?.amount || 0 },
    recentOrders,
    topItems,
    week,
  });
});

// +330 min (IST) -> "+05:30"; Mongo ko isi format me chahiye. getTimezoneOffset IST ke liye -330 deta hai.
function tzString(offsetMin) {
  const east = -offsetMin;
  const sign = east >= 0 ? '+' : '-';
  const abs = Math.abs(east);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

// Global search: customers + items + orders ek saath
export const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 60);
  if (q.length < 2) return res.json({ customers: [], items: [], orders: [] });
  const rx = new RegExp(escapeRegex(q), 'i');

  const [customers, items, orders] = await Promise.all([
    Customer.find({ $or: [{ name: rx }, { customerno: rx }, { phone: rx }] }).limit(5).select('name customerno phone'),
    Item.find({ $or: [{ name: rx }, { category: rx }] }).limit(5).select('name price category isAvailable'),
    Order.find({ $or: [{ ordername: rx }, { billNumber: rx }, { customerno: rx }] }).sort({ createdAt: -1 }).limit(5).select('ordername billNumber amount status'),
  ]);
  res.json({ customers, items, orders });
});