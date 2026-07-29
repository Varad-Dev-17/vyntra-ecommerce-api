import mongoose from "mongoose";

const ReturnRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    originalVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["return", "exchange"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Damaged or Defective Product",
        "Wrong Item Received",
        "Size / Fit Issue",
        "Other"
      ],
      required: true,
    },
    additionalDetails: {
      type: String,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    requestedExchangeVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      // Only required if type is "exchange"
      required: function() {
        return this.type === 'exchange';
      }
    },
    originalPrice: {
      type: Number,
    },
    exchangePrice: {
      type: Number,
    },
    priceDifference: {
      type: Number,
    },
    settlementType: {
      type: String,
      enum: ["additional_payment", "refund", "no_difference"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "received",
        "refunded",
        "exchanged"
      ],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index to quickly find if a user has an active request for a specific order+product+variant
ReturnRequestSchema.index({ order: 1, product: 1, originalVariant: 1 }, { unique: false });

const ReturnRequest = mongoose.model("ReturnRequest", ReturnRequestSchema);
export default ReturnRequest;
