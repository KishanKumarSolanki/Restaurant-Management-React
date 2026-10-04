import mongoose from 'mongoose';

mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

// 👇 YE YAHAN RAKHO (outside function)
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB Error:", err.message);
});

let connecting = null;

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');

  if (mongoose.connection.readyState === 1) return;
  if (connecting) return connecting;

  mongoose.set('strictQuery', true);

  connecting = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000, // thoda increase kar diya
  });

  try {
    await connecting;
  } finally {
    connecting = null;
  }
}