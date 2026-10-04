import mongoose from 'mongoose';

// JSON me _id ki jagah `id` bhejo (frontend ke liye aasan)
mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

let connecting = null;

// Serverless me har request par call hota hai - connection cache hota hai
export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI .env me set nahi hai');
  if (mongoose.connection.readyState === 1) return;
  // Concurrent requests ek hi in-progress connection ko await karein. Promise ko
  // connect hone ke baad retain nahi karte, warna baad me connection drop hone par
  // Mongoose reconnect kiye bina queries buffer karta rahega.
  if (connecting) return connecting;

  mongoose.set('strictQuery', true);
  connecting = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`));

  try {
    await connecting;
  } finally {
    connecting = null;
  }
}
