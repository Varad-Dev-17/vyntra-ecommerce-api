import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import User from "../server/models/user.js";
import Product from "../server/models/product.js";
import Order from "../server/models/order.js";
import { getNextSequence } from "../server/utils/counterHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const migrateSequentialIds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Migrate Users
    const usersWithoutId = await User.find({ customerId: { $exists: false } });
    console.log(`Found ${usersWithoutId.length} users without customerId`);
    
    for (const user of usersWithoutId) {
      const seq = await getNextSequence('customerId');
      user.customerId = `CUST-${seq}`;
      await user.save();
      console.log(`Updated User ${user.email} -> ${user.customerId}`);
    }

    // 2. Migrate Products
    const productsWithoutId = await Product.find({ productId: { $exists: false } });
    console.log(`Found ${productsWithoutId.length} products without productId`);

    for (const product of productsWithoutId) {
      const seq = await getNextSequence('productId');
      product.productId = `PROD-${seq}`;
      await product.save();
      console.log(`Updated Product ${product.title} -> ${product.productId}`);
    }

    // Orders usually already have orderId, but if we wanted to replace all of them we could.
    // However, existing orders might already have tracking emails sent with old IDs, so 
    // it's safer to only apply sequential logic to NEW orders.
    console.log("Skipping existing orders to avoid breaking sent emails.");

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateSequentialIds();
