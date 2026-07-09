import mongoose from "mongoose";

const ProductReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    review: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

ProductReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model("ProductReview", ProductReviewSchema);
