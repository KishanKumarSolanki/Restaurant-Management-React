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
  if (!connecting) {
    mongoose.set('strictQuery', true);
    connecting = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then(() => console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`))
      .catch((e) => {
        connecting = null; // agli request dobara try kare
        throw e;
      });
  }
  await connecting;
}