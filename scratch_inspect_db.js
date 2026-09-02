import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const MONGO_URI = process.env.MONGO_URI;

async function inspectAllCounts() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const deptCount = await mongoose.model('Department', new mongoose.Schema({ name: String })).countDocuments();
  const catCount = await mongoose.model('Category', new mongoose.Schema({ name: String })).countDocuments();
  const brandCount = await mongoose.model('Brand', new mongoose.Schema({ name: String })).countDocuments();

  console.log(`Departments: ${deptCount}, Categories: ${catCount}, Brands: ${brandCount}`);
  mongoose.disconnect();
}

inspectAllCounts().catch(console.error);
