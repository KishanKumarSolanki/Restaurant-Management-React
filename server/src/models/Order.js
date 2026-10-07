import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true }, // snapshot - item delete ho to bhi naam rahe
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  itemNotes: { type: String, default: null },
  itemStatus: { type: String, enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending' },
});

const orderSchema = new mongoose.Schema(
  {
    ordername: { type: String, required: true, trim: true },
    billNumber: { type: String, default: null },
    customerno: { type: String, required: true, trim: true, index: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'online', null], default: null },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending', index: true },
    fulfillmentStatus: { type: String, enum: ['preparing', 'ready', 'served'], default: 'preparing' },
    readyAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedStaffName: { type: String, default: null },
    assignmentNotes: { type: String, default: null },
    assignedAt: { type: Date, default: null },
    items: [orderItemSchema],
  },
  { timestamps: true }
);

orderSchema.virtual('assignmentName').get(function () {
  return (this.assignedTo && this.assignedTo.name) || this.assignedStaffName || null;
});

export default mongoose.model('Order', orderSchema);
