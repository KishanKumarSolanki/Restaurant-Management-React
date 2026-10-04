import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    customerno: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: null },
    preferences: { type: String, trim: true, default: null },
    feedback: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
