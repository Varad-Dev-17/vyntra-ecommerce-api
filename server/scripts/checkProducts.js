import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Product from "../models/product.js";
import Category from "../models/category.js";
import Department from "../models/department.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const check = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const products = await Product.find().select('title category').populate('category department').lean();
    console.log("ALL PRODUCTS IN DB:");
    products.forEach(p => {
      console.log(`- ${p.title} | Category: ${p.category?.name} | Dept: ${p.department?.name}`);
    });
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
    process.exit(1);
  }
};

check();
