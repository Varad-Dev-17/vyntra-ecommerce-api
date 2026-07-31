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
        mrp: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        basePrice: { type: Number, required: true },
        gstRate: { type: Number, required: true },
        gstAmount: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      name: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      phone: String,
    },
    totalMRP: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
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
    deliveredAt: { type: Date, default: null },
    trackingNumber: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;
