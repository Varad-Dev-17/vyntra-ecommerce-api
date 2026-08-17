import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Product from "../models/product.js";
import { getNextSequence } from "../utils/counterHelper.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const fixProductIds = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const products = await Product.find({
      $or: [
        { productId: { $exists: false } },
        { productId: null },
        { productId: "" }
      ]
    });

    console.log(`Found ${products.length} products without productId.`);

    let count = 0;
    for (const product of products) {
      const seq = await getNextSequence('productId');
      const newProductId = `PROD-${seq}`;
      product.productId = newProductId;
      await product.save();
      console.log(`Updated product '${product.title}' with ID: ${newProductId}`);
      count++;
    }

    console.log(`Successfully assigned PROD IDs to ${count} products.`);
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
    process.exit(1);
  }
};

fixProductIds();
