import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      name: String,
      address: String,
      city: String,
      phone: String,
    },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    coupon: {
      code: String,
      type: { type: String },
      value: Number,
    },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed", "refunded"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    },
    trackingNumber: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;
