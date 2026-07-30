import mongoose from "mongoose";

const ProductImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    attributes: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        option: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeOption",
          required: true,
        },
      }
    ],
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    gstRate: {
      type: Number,
      required: true,
      enum: [0, 5, 12, 18, 28],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    mainImage: ProductImageSchema,
    galleryImages: [ProductImageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Variant", VariantSchema);
