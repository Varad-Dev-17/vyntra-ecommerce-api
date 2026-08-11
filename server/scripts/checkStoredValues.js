import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import AttributeOption from "../models/attributeOption.js";
import Attribute from "../models/attribute.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const check = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const options = await AttributeOption.find().populate('attribute');
    
    console.log("ATTRIBUTE OPTIONS CHECK:");
    options.slice(0, 10).forEach(opt => {
      console.log(`- ${opt.attribute?.name}: [Display: ${opt.displayName}] | [Stored: ${opt.storedValue}]`);
    });

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
    process.exit(1);
  }
};

check();
