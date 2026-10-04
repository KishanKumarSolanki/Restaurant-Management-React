import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    menuCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', default: null },
    category: { type: String, required: true, trim: true }, // category ka naam (denormalized)
    description: { type: String, trim: true, default: null },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);
