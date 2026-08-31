import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../server/models/product.js";
import Variant from "../server/models/variant.js";

// Models that we need to interact with
const Department = mongoose.model("Department", new mongoose.Schema({}, { strict: false }));
const Category = mongoose.model("Category", new mongoose.Schema({}, { strict: false }));
const Brand = mongoose.model("Brand", new mongoose.Schema({}, { strict: false }));
const Attribute = mongoose.model("Attribute", new mongoose.Schema({}, { strict: false }));
const AttributeOption = mongoose.model("AttributeOption", new mongoose.Schema({
  attribute: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' },
  displayName: String,
  storedValue: String,
  hex: String,
  status: { type: String, default: 'active' }
}, { strict: false, collection: 'attributeoptions' }));

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedIPhone = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Get Base Taxonomies
    const dept = await Department.findOne({ name: "Electronics" });
    const category = await Category.findOne({ name: "Phone", departmentIds: dept._id });
    let brand = await Brand.findOne({ name: "Apple" });

    if (!dept || !category) {
      throw new Error("Missing Electronics department or Phone category");
    }

    if (!brand) {
      console.log("Apple brand not found, creating it...");
      brand = await Brand.create({
        name: "Apple",
        slug: "apple",
        status: "Active",
        departmentIds: [dept._id]
      });
    }

    // 2. Fetch required Attributes
    const attrs = await Attribute.find({
      name: { $in: ["Color", "Storage", "RAM", "Display Size", "Processor", "Operating System"] }
    });

    const attrMap = attrs.reduce((acc, a) => {
      acc[a.name] = a;
      return acc;
    }, {});

    const requiredAttrs = ["Color", "Storage", "RAM", "Display Size", "Processor", "Operating System"];
    for (const req of requiredAttrs) {
      if (!attrMap[req]) {
        throw new Error(`Missing required attribute: ${req}`);
      }
    }

    // Ensure Phone category is linked to these attributes
    for (const attr of attrs) {
      if (!attr.categoryIds.includes(category._id)) {
        console.log(`Adding Phone category to Attribute: ${attr.name}`);
        await Attribute.updateOne(
          { _id: attr._id },
          { $addToSet: { categoryIds: category._id } }
        );
      }
    }

    // 3. Helper to get or create an Option
    const getOrCreateOption = async (attrName, displayName, hex = null) => {
      const attribute = attrMap[attrName];
      let option = await AttributeOption.findOne({
        attribute: attribute._id,
        displayName: { $regex: new RegExp(`^${displayName}$`, 'i') }
      });
      
      if (!option) {
        console.log(`Creating new option: ${displayName} for ${attrName}`);
        const storedValue = displayName.toUpperCase().replace(/\s+/g, '_');
        const optData = {
          attribute: attribute._id,
          displayName,
          storedValue,
          status: "active"
        };
        if (hex) optData.hex = hex;
        
        option = await AttributeOption.create(optData);
      }
      return option;
    };

    // Get Colors
    const colorBlue = await getOrCreateOption("Color", "Blue", "#0000FF");
    const colorWhite = await getOrCreateOption("Color", "White", "#FFFFFF");
    const colorSlateBlue = await getOrCreateOption("Color", "Slate Blue", "#6A5ACD");

    // Get Storages
    const storage256 = await getOrCreateOption("Storage", "256GB");
    const storage512 = await getOrCreateOption("Storage", "512GB");

    // Get RAM
    const ram8 = await getOrCreateOption("RAM", "8GB");

    // 4. Create Product
    console.log("Creating Product...");
    const product = new Product({
      productId: `IP16PM-${Date.now()}`,
      title: "Apple iPhone 16 Pro Max",
      slug: `apple-iphone-16-pro-max-${Date.now()}`,
      shortDescription: "A18 Pro chip. Superfast. Supersmart.",
      longDescription: "The most powerful iPhone ever. Featuring the new A18 Pro chip, a stunning 6.9-inch Super Retina XDR display, and the ultimate pro camera system.",
      department: dept._id,
      category: category._id,
      brand: brand._id,
      status: "Active",
      attributes: [
        {
          attribute: attrMap["Display Size"]._id,
          values: ["6.9-inch Super Retina XDR"]
        },
        {
          attribute: attrMap["Processor"]._id,
          values: ["A18 Pro"]
        },
        {
          attribute: attrMap["Operating System"]._id,
          values: ["iOS 18"]
        }
      ]
    });

    await product.save();
    console.log(`Product created with ID: ${product._id}`);

    // 5. Create Variants
    const createVariant = async (colorOpt, storageOpt, price, skuPrefix) => {
      const variant = new Variant({
        product: product._id,
        sku: `${skuPrefix}-${Date.now()}`,
        mrp: price + 10000,
        price: price,
        stock: 50,
        status: "Active",
        attributes: [
          { attribute: attrMap["Color"]._id, option: colorOpt._id },
          { attribute: attrMap["Storage"]._id, option: storageOpt._id },
          { attribute: attrMap["RAM"]._id, option: ram8._id }
        ]
      });
      await variant.save();
      console.log(`Created Variant: ${colorOpt.displayName} ${storageOpt.displayName}`);
    };

    console.log("Creating Variants...");
    // Blue 256 & 512
    await createVariant(colorBlue, storage256, 144900, "IP16PM-BLU-256");
    await createVariant(colorBlue, storage512, 164900, "IP16PM-BLU-512");
    
    // White 256
    await createVariant(colorWhite, storage256, 144900, "IP16PM-WHT-256");

    // Slate Blue 256
    await createVariant(colorSlateBlue, storage256, 144900, "IP16PM-SBL-256");

    console.log("Successfully seeded iPhone 16 Pro Max with Blue, White, and Slate Blue variants!");
    process.exit(0);

  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedIPhone();
