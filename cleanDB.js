import mongoose from "mongoose";
import dotenv from "dotenv";
import ReturnRequest from "./server/models/returnRequest.js";
import Order from "./server/models/order.js";

dotenv.config();

async function cleanDB() {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Connecting to database...");
    await mongoose.connect(uri);
    
    console.log("Deleting all return requests...");
    const returnResult = await ReturnRequest.deleteMany({});
    console.log(`Deleted ${returnResult.deletedCount} return requests.`);
    
    console.log("Deleting all orders...");
    const orderResult = await Order.deleteMany({});
    console.log(`Deleted ${orderResult.deletedCount} orders.`);
    
    console.log("Database cleaned successfully.");
  } catch (error) {
    console.error("Error cleaning database:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanDB();
