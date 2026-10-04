import mongoose from 'mongoose';

const staffShiftSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shiftDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true },
    section: { type: String, trim: true, default: null },
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'off'], default: 'scheduled' },
    notes: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('StaffShift', staffShiftSchema);
