import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate } from '../utils/paginate.js';

const findOr404 = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new ApiError(404, 'Customer not found.');
  return customer;
};

export const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { customerno: rx }, { phone: rx }];
  }
  res.json(await paginate(Customer, filter, req, { sort: { name: 1 } }));
});

export const show = asyncHandler(async (req, res) => {
  const customer = await findOr404(req.params.id);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = 10;
  const filter = { customerno: customer.customerno };

  const [total, orders, completedOrders, activeOrders, spent] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter).populate('assignedTo', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments({ ...filter, status: 'completed' }),
    Order.countDocuments({ ...filter, status: { $in: ['pending', 'processing'] } }),
    Order.aggregate([{ $match: { ...filter, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  res.json({
    customer,
    summary: { totalOrders: total, completedOrders, activeOrders, totalSpent: spent[0]?.total || 0 },
    orders: { data: orders, meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } },
  });
});

export const create = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ customer, message: 'Customer created successfully.' });
});

export const getOne = asyncHandler(async (req, res) => res.json({ customer: await findOr404(req.params.id) }));

export const update = asyncHandler(async (req, res) => {
  const customer = await findOr404(req.params.id);
  const oldNo = customer.customerno;
  customer.set(req.body);
  await customer.save();
  // customer number badla to purane orders ka link bhi update karo
  if (oldNo !== customer.customerno) await Order.updateMany({ customerno: oldNo }, { $set: { customerno: customer.customerno } });
  res.json({ customer, message: 'Customer updated successfully!' });
});

export const remove = asyncHandler(async (req, res) => {
  const customer = await findOr404(req.params.id);
  await customer.deleteOne();
  res.json({ message: 'Customer deleted successfully.' });
});
