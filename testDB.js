import mongoose from "mongoose";
import ReturnRequest from "./server/models/returnRequest.js";
import Order from "./server/models/order.js";

async function check() {
  await mongoose.connect("mongodb+srv://varadmule0:9R7E9F90P0yU4Ww8@vyntracluster.w8yid.mongodb.net/vyntra?retryWrites=true&w=majority");
  
  const reqs = await ReturnRequest.find().lean();
  console.log("Total Requests:", reqs.length);
  
  for (let r of reqs) {
    const order = await Order.findById(r.order).lean();
    console.log(`Request ${r._id}: Order Reference ${r.order}, Order Exists in DB? ${!!order}`);
    if (order) {
        console.log(` - Order ID: ${order.orderId}`);
    }
  }
  
  process.exit(0);
}

check();
