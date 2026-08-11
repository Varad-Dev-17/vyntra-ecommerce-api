import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Product from "../models/product.js";
import Attribute from "../models/attribute.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const check = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Fetch a couple of the women's products seeded earlier
    const products = await Product.find({ 
      title: { $in: ["Women's Sports T-Shirt", "Women's High Rise Skinny Jeans", "Women's Anarkali Kurta Set"] } 
    }).populate('attributes.attribute').lean();
    
    console.log("CHECKING PRODUCT ATTRIBUTES IN DB:\n");

    for (const p of products) {
      console.log(`Product: ${p.title}`);
      if (!p.attributes || p.attributes.length === 0) {
        console.log("  -> Attributes array is EMPTY! ❌");
      } else {
        p.attributes.forEach(attrObj => {
          const attrName = attrObj.attribute ? attrObj.attribute.name : "MISSING_ATTRIBUTE_REF";
          console.log(`  -> ${attrName}: [${attrObj.values.join(", ")}] ✅`);
        });
      }
      console.log("--------------------------------------------------");
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
