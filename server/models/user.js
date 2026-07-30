import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    customerId: { type: String, unique: true, sparse: true },
    profileImage: {
      url: { type: String },
      publicId: { type: String }
    },
    username: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      minLength: [5, "Email must be at least 5 characters"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minLength: [6, "Password must be at least 6 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Date,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Date,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    mobileNo: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
