import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Product from "../models/product.js";
import Variant from "../models/variant.js";
import Brand from "../models/brand.js";
import Category from "../models/category.js";
import Department from "../models/department.js";
import Attribute from "../models/attribute.js";
import AttributeOption from "../models/attributeOption.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const inspect = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const product = await Product.findOne().populate('brand category department attributes.attribute').lean();
    if (!product) {
      console.log("No products found in DB.");
      process.exit(0);
    }
    
    const variants = await Variant.find({ product: product._id }).populate('attributes.attribute attributes.option').lean();
    
    console.log("PRODUCT SAMPLE:", JSON.stringify(product, null, 2));
    console.log("VARIANT SAMPLE:", JSON.stringify(variants, null, 2));

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
  }
};

inspect();
