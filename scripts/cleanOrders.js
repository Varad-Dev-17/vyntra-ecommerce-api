import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../server/config/db.js';
import Order from '../server/models/order.js';
import ReturnRequest from '../server/models/returnRequest.js';

const cleanOrders = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Cleaning orders and return requests...');

    const deletedOrders = await Order.deleteMany({});
    const deletedReturns = await ReturnRequest.deleteMany({});

    console.log(`Successfully deleted ${deletedOrders.deletedCount} orders and ${deletedReturns.deletedCount} return requests!`);
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning orders:', error);
    process.exit(1);
  }
};

cleanOrders();
