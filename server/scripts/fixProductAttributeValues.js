import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Product from "../models/product.js";
import AttributeOption from "../models/attributeOption.js";
import Department from "../models/department.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const fix = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for fixing Product Attribute Values...");

    const womenDept = await Department.findOne({ name: new RegExp('^women', 'i') });
    if (!womenDept) {
      throw new Error("Women dept not found");
    }

    const products = await Product.find({ department: womenDept._id });
    let fixedCount = 0;

    for (const product of products) {
      let needsSave = false;

      for (let i = 0; i < product.attributes.length; i++) {
        const attrObj = product.attributes[i];
        
        // Skip if values array is empty
        if (!attrObj.values || attrObj.values.length === 0) continue;

        const currentValue = attrObj.values[0];

        // Find the AttributeOption that has this displayName for this specific attribute
        const option = await AttributeOption.findOne({ 
          attribute: attrObj.attribute,
          displayName: new RegExp('^' + currentValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')
        });

        if (option && option.storedValue !== currentValue) {
          // Update the product's value to use the correct storedValue (e.g., "POLYESTER" instead of "Polyester")
          product.attributes[i].values = [option.storedValue];
          needsSave = true;
          console.log(`[${product.title}] Fixed value: "${currentValue}" -> "${option.storedValue}"`);
        }
      }

      if (needsSave) {
        await product.save();
        fixedCount++;
      }
    }

    console.log(`Successfully fixed attribute values on ${fixedCount} products!`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
    process.exit(1);
  }
};

fix();
