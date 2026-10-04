import 'dotenv/config';
import { connectDB } from './config/db.js'; // mongoose global settings pehle
import app from './app.js';

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET .env me set nahi hai');
  await connectDB();
  app.listen(PORT, () => console.log(`Cafe Express API running on http://localhost:${PORT}/api`));
}

start().catch((err) => {
  console.error('Server start nahi ho paya:', err.message);
  process.exit(1);
});
