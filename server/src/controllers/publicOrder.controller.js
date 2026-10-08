import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextSequence } from '../utils/counter.js';

const GST_RATE = 5;

export const menu = asyncHandler(async (_req, res) => {
  const items = await Item.find({ isAvailable: true }).sort({ category: 1, name: 1 });
  res.json({ data: items });
});

async function prepareItems(lines) {
  const ids = [...new Set(lines.map((line) => line.item))];
  if (ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(422, 'One or more menu items are invalid.');

  const found = await Item.find({ _id: { $in: ids }, isAvailable: true });
  const byId = new Map(found.map((item) => [item.id, item]));
  const items = lines.map((line) => {
    const item = byId.get(line.item);
    if (!item) throw new ApiError(422, 'One or more selected items are unavailable.');
    return {
      item: item.id,
      itemName: item.name,
      quantity: line.quantity,
      unitPrice: item.price,
      lineTotal: item.price * line.quantity,
      itemNotes: line.itemNotes,
      itemStatus: 'pending',
    };
  });
  return { items, quantity: items.reduce((total, item) => total + item.quantity, 0), amount: items.reduce((total, item) => total + item.lineTotal, 0) };
}

export const create = asyncHandler(async (req, res) => {
  const { customerName, phone, tableNumber, notes, items: lines } = req.body;
  // A phone number identifies returning walk-in customers without exposing customer records publicly.
  let customer = await Customer.findOne({ phone });
  if (!customer) {
    customer = await Customer.create({
      customerno: `QR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: customerName,
      phone,
      address: tableNumber ? `Table ${tableNumber}` : 'QR / takeaway order',
    });
  }

  const prepared = await prepareItems(lines);
  const gstAmount = Number((prepared.amount * GST_RATE / 100).toFixed(2));
  const seq = await nextSequence('bill');
  const order = await Order.create({
    ordername: tableNumber ? `QR order - Table ${tableNumber}` : `QR order - ${customerName}`,
    customerno: customer.customerno,
    status: 'pending',
    notes,
    billNumber: `BILL-${String(seq).padStart(6, '0')}`,
    ...prepared,
    gstRate: GST_RATE,
    gstAmount,
    grandTotal: Number((prepared.amount + gstAmount).toFixed(2)),
  });

  res.status(201).json({ order, message: 'Your order has been sent to the restaurant.' });
});
