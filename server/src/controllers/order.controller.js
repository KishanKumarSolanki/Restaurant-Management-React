import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import Customer from '../models/Customer.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate } from '../utils/paginate.js';
import { nextSequence } from '../utils/counter.js';

const POPULATE_STAFF = { path: 'assignedTo', select: 'name' };
const GST_RATE = 5;

const withGst = (prepared) => {
  const gstAmount = Number((prepared.amount * GST_RATE / 100).toFixed(2));
  return { ...prepared, gstRate: GST_RATE, gstAmount, grandTotal: Number((prepared.amount + gstAmount).toFixed(2)) };
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

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
  if (status === 'completed') throw new ApiError(422, 'Orders can only be completed after admin approval.');
  await assertCustomer(customerno);
  const prepared = withGst(await prepareItems(req.body.items));
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
  if (status === 'completed' && order.status !== 'completed') {
    throw new ApiError(422, 'Orders can only be completed after admin approval.');
  }
  await assertCustomer(customerno);
  const prepared = withGst(await prepareItems(req.body.items));

  order.set({ ordername, customerno, status, notes, ...prepared });
  await order.save();
  res.json({ order, message: 'Order updated successfully.' });
});

export const approveCompletion = asyncHandler(async (req, res) => {
  const order = await findOr404(req.params.id);
  if (!['pending', 'processing'].includes(order.status)) {
    throw new ApiError(422, 'Only active orders can be approved.');
  }
  if (order.fulfillmentStatus !== 'served') {
    throw new ApiError(422, 'The assigned staff must mark this order served before approval.');
  }

  order.status = 'completed';
  order.approvedAt = new Date();
  order.approvedBy = req.user.id;
  await order.save();
  res.json({ order, message: `Order ${order.ordername} approved and completed.` });
});

// A portable HTML invoice downloads as a file and can be opened/printed as a bill.
export const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await findOr404(req.params.id);
  if (order.status !== 'completed') throw new ApiError(422, 'Invoice is available after the order is completed.');
  const rate = order.gstRate ?? GST_RATE;
  const gst = order.gstAmount ?? Number((order.amount * rate / 100).toFixed(2));
  const total = order.grandTotal ?? Number((order.amount + gst).toFixed(2));
  const rows = order.items.map((item) => `<tr><td>${escapeHtml(item.itemName)}</td><td>${item.quantity}</td><td>${money(item.unitPrice)}</td><td>${money(item.lineTotal)}</td></tr>`).join('');
  const completedAt = order.approvedAt || order.updatedAt;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(order.billNumber)}</title><style>body{font:14px Arial;color:#222;max-width:720px;margin:36px auto;padding:0 20px}h1{margin:0;color:#1f2937}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}th:last-child,td:last-child{text-align:right}.totals{margin-left:auto;width:300px}.totals p{display:flex;justify-content:space-between;margin:8px 0}.grand{font-size:18px;font-weight:bold;border-top:2px solid #222;padding-top:10px}@media print{body{margin:0;max-width:none}}</style></head><body><h1>Cafe Express</h1><p><strong>Tax Invoice:</strong> ${escapeHtml(order.billNumber)}<br><strong>Order:</strong> ${escapeHtml(order.ordername)}<br><strong>Customer No:</strong> ${escapeHtml(order.customerno)}<br><strong>Completed:</strong> ${new Date(completedAt).toLocaleString('en-IN')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><p><span>Subtotal</span><span>${money(order.amount)}</span></p><p><span>GST (${rate}%)</span><span>${money(gst)}</span></p><p class="grand"><span>Grand Total</span><span>${money(total)}</span></p></div><p>Thank you for dining with us.</p></body></html>`;
  res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `attachment; filename="${order.billNumber || 'invoice'}.html"` }).send(html);
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
