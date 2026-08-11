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

const fixMappings = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for fixing Attribute Mappings...");

    // The attributes that belong to specific categories based on our seed data
    const categoryToAttributes = {
      "T-Shirts": ["Fit", "Sleeve", "Fabric", "Pattern", "Neck", "Color", "Size"],
      "Kurti Set": ["Fabric", "Sleeve", "Pattern", "Set Includes", "Neck", "Kurta Style", "Color", "Size"],
      "Jeans": ["Fit", "Rise", "Fabric", "Length", "Color", "Size"]
    };

    let mappingsCreated = 0;

    for (const [catName, attrNames] of Object.entries(categoryToAttributes)) {
      const category = await Category.findOne({ name: new RegExp('^' + catName + '$', 'i') });
      if (!category) continue;

      for (const attrName of attrNames) {
        const attribute = await Attribute.findOne({ name: new RegExp('^' + attrName + '$', 'i') });
        if (!attribute) continue;

        // 1. Update AttributeMapping Collection
        const existingMapping = await AttributeMapping.findOne({ category: category._id, attribute: attribute._id });
        if (!existingMapping) {
          await AttributeMapping.create({ category: category._id, attribute: attribute._id });
          mappingsCreated++;
        }

        // 2. Update Attribute.categoryIds Array (for backward compatibility if needed)
        if (!attribute.categoryIds.includes(category._id)) {
          attribute.categoryIds.push(category._id);
          await attribute.save();
        }
      }
    }

    console.log(`Successfully created ${mappingsCreated} missing Attribute-Category mappings!`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error fixing mappings:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

fixMappings();
