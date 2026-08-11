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

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const fixOrphanedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for fixing orphaned products...");

    // Fetch all departments
    const departments = await Department.find();
    
    const menDept = departments.find(d => d.name.toLowerCase() === 'men');
    const womenDept = departments.find(d => d.name.toLowerCase() === 'women' || d.name.toLowerCase() === 'womens');
    const electronicsDept = departments.find(d => d.name.toLowerCase() === 'electronics');

    if (!menDept || !womenDept || !electronicsDept) {
      console.error("Could not find required departments in the database.");
      process.exit(1);
    }

    // Fetch all products
    const products = await Product.find();

    let updatedCount = 0;

    for (const product of products) {
      const currentDeptIdStr = product.department ? product.department.toString() : null;
      const isValid = departments.some(d => d._id.toString() === currentDeptIdStr);

      if (!isValid) {
        let targetDeptId = null;

        const title = product.title.toLowerCase();
        
        // Smart mapping based on title
        if (title.includes('macbook') || title.includes('laptop') || title.includes('phone')) {
          targetDeptId = electronicsDept._id;
        } else if (title.includes('women') || title.includes('kurta')) {
          targetDeptId = womenDept._id;
        } else if (title.includes('men') || title.includes('polo') || title.includes('formal shirt')) {
          targetDeptId = menDept._id;
        } else {
          // Default fallback to Men for the rest of the shirts based on the screenshot
          targetDeptId = menDept._id;
        }

        if (targetDeptId) {
          product.department = targetDeptId;
          await product.save();
          console.log(`Fixed product: "${product.title}" -> Mapped to department ID: ${targetDeptId}`);
          updatedCount++;
        }
      }
    }

    console.log(`Successfully fixed ${updatedCount} orphaned products!`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error fixing products:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

fixOrphanedProducts();
