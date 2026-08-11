import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Product from "../models/product.js";
import Department from "../models/department.js";
import Category from "../models/category.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const check = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const elecDept = await Department.findOne({ name: new RegExp('^electronics', 'i') });
    if (!elecDept) {
      console.log("Electronics department not found!");
    } else {
      console.log(`Found Electronics Department: ${elecDept._id}`);
      
      const categories = await Category.find({ departmentIds: elecDept._id });
      console.log("Categories in Electronics:");
      categories.forEach(c => console.log(`- ${c.name}`));

      const products = await Product.find({ department: elecDept._id }).populate('category brand');
      console.log("\nProducts in Electronics:");
      products.forEach(p => console.log(`- ${p.title} (Category: ${p.category?.name}, Brand: ${p.brand?.name})`));
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
    process.exit(1);
  }
};

check();
