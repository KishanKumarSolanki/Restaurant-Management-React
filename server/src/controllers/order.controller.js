import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import Customer from '../models/Customer.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate } from '../utils/paginate.js';
import { nextSequence } from '../utils/counter.js';

const POPULATE_STAFF = { path: 'assignedTo', select: 'name' };

const findOr404 = async (id) => {
  const order = mongoose.isValidObjectId(id) ? await Order.findById(id).populate(POPULATE_STAFF) : null;
  if (!order) throw new ApiError(404, 'Order not found.');
  return order;
};

// price hamesha DB se (client ka price trust nahi karte)
async function prepareItems(lines) {
  const ids = [...new Set(lines.map((l) => l.item))];
  const invalid = ids.find((id) => !mongoose.isValidObjectId(id));
  const found = invalid ? [] : await Item.find({ _id: { $in: ids } });
  const byId = new Map(found.map((i) => [i.id, i]));

  const items = lines.map((line, index) => {
    const item = byId.get(line.item);
    if (!item) throw new ApiError(422, 'Selected item was not found.', { [`items.${index}.item`]: 'Selected item was not found.' });
    return {
      item: item.id,
      itemName: item.name,
      quantity: line.quantity,
      unitPrice: item.price,
      lineTotal: line.quantity * item.price,
      itemNotes: line.itemNotes,
      itemStatus: line.itemStatus,
    };
  });

  return {
    items,
    quantity: items.reduce((s, i) => s + i.quantity, 0),
    amount: items.reduce((s, i) => s + i.lineTotal, 0),
  };
}

async function assertCustomer(customerno) {
  if (!(await Customer.exists({ customerno }))) {
    throw new ApiError(422, 'Selected customer does not exist.', { customerno: 'Selected customer does not exist.' });
  }
}

export const list = asyncHandler(async (req, res) => {
  res.json(await paginate(Order, {}, req, { populate: POPULATE_STAFF }));
});

// cart = jin orders ka payment abhi nahi hua
export const cart = asyncHandler(async (_req, res) => {
  const orders = await Order.find({ paidAt: null }).populate(POPULATE_STAFF).sort({ createdAt: -1 });
  res.json({ data: orders, count: orders.length });
});

export const cartCount = asyncHandler(async (_req, res) => {
  res.json({ count: await Order.countDocuments({ paidAt: null }) });
});

export const getOne = asyncHandler(async (req, res) => res.json({ order: await findOr404(req.params.id) }));

export const create = asyncHandler(async (req, res) => {
  const { ordername, customerno, status, notes } = req.body;
  await assertCustomer(customerno);
  const prepared = await prepareItems(req.body.items);
  const seq = await nextSequence('bill');

  const order = await Order.create({
    ordername, customerno, status, notes,
    billNumber: `BILL-${String(seq).padStart(6, '0')}`,
    ...prepared,
  });
  res.status(201).json({ order, message: `Order ${order.ordername} cart me add ho gaya.` });
});

export const update = asyncHandler(async (req, res) => {
  const order = await findOr404(req.params.id);
  const { ordername, customerno, status, notes } = req.body;
  await assertCustomer(customerno);
  const prepared = await prepareItems(req.body.items);

  order.set({ ordername, customerno, status, notes, ...prepared });
  await order.save();
  res.json({ order, message: 'Order updated successfully.' });
});

export const savePayment = asyncHandler(async (req, res) => {
  const order = await findOr404(req.params.id);
  order.paymentMethod = req.body.paymentMethod;
  order.paymentStatus = 'paid';
  order.paidAt = new Date();
  await order.save();
  res.json({ order, message: `Payment saved for ${order.ordername}.` });
});

export const remove = asyncHandler(async (req, res) => {
  const order = await findOr404(req.params.id);
  await order.deleteOne();
  res.json({ message: 'Order deleted successfully.' });
});
