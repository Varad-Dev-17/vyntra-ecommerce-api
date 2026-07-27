import mongoose from "mongoose";

const AttributeMappingSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
  },
  { timestamps: true }
);

// Enforce unique mapping per Category
AttributeMappingSchema.index({ category: 1, attribute: 1 }, { unique: true });

export default mongoose.model("AttributeMapping", AttributeMappingSchema);
