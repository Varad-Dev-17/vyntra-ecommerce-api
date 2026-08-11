import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Category from "../models/category.js";
import Attribute from "../models/attribute.js";
import AttributeMapping from "../models/attributeMapping.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const scan = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Check if new attributes were mapped to categories in AttributeMapping
    const mappings = await AttributeMapping.find().populate('category attribute');
    const attributes = await Attribute.find();
    
    console.log(`Total Attributes in DB: ${attributes.length}`);
    console.log(`Total Attribute Mappings in DB: ${mappings.length}`);
    
    // Check if attributes array categoryIds is populated
    const unmappedAttributes = attributes.filter(a => a.categoryIds && a.categoryIds.length === 0);
    console.log(`Attributes with empty categoryIds array: ${unmappedAttributes.length}`);

    // Check which attributes are not in any AttributeMapping
    const mappedAttributeIds = mappings.map(m => m.attribute?._id.toString());
    const completelyUnmapped = attributes.filter(a => !mappedAttributeIds.includes(a._id.toString()));
    
    console.log(`Attributes not found in ANY AttributeMapping:`);
    completelyUnmapped.forEach(a => console.log(` - ${a.name} (Usage: ${a.usage})`));

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
    process.exit(1);
  }
};

scan();
