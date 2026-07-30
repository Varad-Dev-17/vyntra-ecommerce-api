import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getNextSequence } from "./utils/counterHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");
    const seq = await getNextSequence('testId');
    console.log("Got seq:", seq);
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}
test();
