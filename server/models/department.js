import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    description: {
      type: String,
      trim: true,
    },

    iconName: {
      type: String,
      trim: true,
      default: "Box",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Department", DepartmentSchema);
