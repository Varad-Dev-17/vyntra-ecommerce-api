import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 10000 }
});

const Counter = mongoose.model("Counter", CounterSchema);
export default Counter;
