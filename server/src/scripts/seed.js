import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import MenuCategory from '../models/MenuCategory.js';
import Item from '../models/Item.js';

async function seed() {
  await connectDB();

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@cafe.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  if (!(await User.exists({ email }))) {
    await User.create({ name: 'Admin', email, password, role: 'admin', hireDate: new Date() });
    console.log(`Admin user bana: ${email} / ${password}`);
  } else {
    console.log(`Admin user pehle se hai: ${email}`);
  }

  if ((await MenuCategory.countDocuments()) === 0) {
    const cats = await MenuCategory.insertMany([
      { name: 'Starters', description: 'Starters items' },
      { name: 'Main Course', description: 'Main Course items' },
      { name: 'Beverages', description: 'Beverages items' },
      { name: 'Desserts', description: 'Desserts items' },
    ]);
    const c = Object.fromEntries(cats.map((x) => [x.name, x]));
    const mk = (name, price, cat, description) => ({ name, price, menuCategory: c[cat].id, category: cat, description });
    await Item.insertMany([
      mk('Veg Spring Roll', 120, 'Starters', 'Crispy rolls with veggies'),
      mk('Paneer Tikka', 220, 'Starters', 'Grilled cottage cheese'),
      mk('Butter Chicken', 320, 'Main Course', 'Creamy tomato gravy'),
      mk('Dal Makhani', 240, 'Main Course', 'Slow cooked black lentils'),
      mk('Cold Coffee', 110, 'Beverages', 'Chilled coffee with ice cream'),
      mk('Masala Chai', 40, 'Beverages', 'Hot Indian tea'),
      mk('Gulab Jamun', 90, 'Desserts', '2 pieces'),
    ]);
    console.log('Sample menu categories + items add ho gaye');
  }

  if ((await Customer.countDocuments()) === 0) {
    await Customer.insertMany([
      { customerno: 'C-001', name: 'Rahul Sharma', phone: '9876543210', address: 'Connaught Place, Delhi' },
      { customerno: 'C-002', name: 'Priya Singh', phone: '9123456780', address: 'Sector 18, Noida' },
    ]);
    console.log('Sample customers add ho gaye');
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
