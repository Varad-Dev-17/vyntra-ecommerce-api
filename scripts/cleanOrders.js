import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Order from "../server/models/order.js";
import Counter from "../server/models/counter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const cleanOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await Order.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} orders from the database.`);

    // Reset the orderId counter back to 10000 since all orders are wiped
    await Counter.updateOne({ _id: 'orderId' }, { seq: 10000 }, { upsert: true });
    console.log("Reset orderId counter back to 10000.");

    process.exit(0);
  } catch (error) {
    console.error("Failed to clean orders:", error);
    process.exit(1);
  }
};

cleanOrders();
