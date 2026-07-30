import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Counter from "../server/models/counter.js";
import User from "../server/models/user.js";
import Product from "../server/models/product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const fixCounters = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Update existing counters to start at 10000+
    await Counter.updateOne({ _id: 'customerId' }, { seq: 10000 });
    await Counter.updateOne({ _id: 'productId' }, { seq: 10000 });
    await Counter.updateOne({ _id: 'orderId' }, { seq: 10000 }, { upsert: true });

    // Reset the products and users so we can remigrate
    await User.updateMany({}, { $unset: { customerId: 1 } });
    await Product.updateMany({}, { $unset: { productId: 1 } });

    console.log("Counters fixed and previous IDs removed. Ready to remigrate.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixCounters();
