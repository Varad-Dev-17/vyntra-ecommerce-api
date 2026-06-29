import mongoose from "mongoose";

// mongodb connect with async await
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB database connected...");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
