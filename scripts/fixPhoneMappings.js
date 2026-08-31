import mongoose from "mongoose";
import dotenv from "dotenv";
import AttributeMapping from "../server/models/attributeMapping.js";

// Models that we need to interact with
const Category = mongoose.model("Category", new mongoose.Schema({}, { strict: false }));
const Attribute = mongoose.model("Attribute", new mongoose.Schema({}, { strict: false }));

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

const fixMappings = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const category = await Category.findOne({ name: "Phone" });
    if (!category) throw new Error("Phone category not found");

    const attrs = await Attribute.find({
      name: { $in: ["Color", "Storage", "RAM", "Display Size", "Processor", "Operating System"] }
    });

    console.log(`Found ${attrs.length} attributes to map to Phone category`);

    for (const attr of attrs) {
      const existingMapping = await AttributeMapping.findOne({
        category: category._id,
        attribute: attr._id
      });

      if (!existingMapping) {
        console.log(`Creating mapping for ${attr.name}`);
        await AttributeMapping.create({
          category: category._id,
          attribute: attr._id
        });
      } else {
        console.log(`Mapping for ${attr.name} already exists`);
      }
    }

    console.log("Mappings fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing mappings:", error);
    process.exit(1);
  }
};

fixMappings();
