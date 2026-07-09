import mongoose from "mongoose";
import Category from "./server/models/category.js";
import SubCategory from "./server/models/subCategory.js";
import Brand from "./server/models/brand.js";
import Attribute from "./server/models/attribute.js";
import AttributeOption from "./server/models/attributeOption.js";
import User from "./server/models/user.js";

const MONGO_URI = "mongodb+srv://varadmule17_db_user:nXF4llZmAIO1dSGn@vam.6n038fi.mongodb.net/ecommerce?appName=VAM";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ isAdmin: true });
    if (!admin) throw new Error("No admin user found to set createdBy");

    const adminId = admin._id;

    // STEP 4: CATEGORIES
    console.log("Adding Categories...");
    const electronics = await Category.findOneAndUpdate({ name: "Electronics" }, { name: "Electronics", createdBy: adminId }, { upsert: true, new: true });
    const fashion = await Category.findOneAndUpdate({ name: "Fashion" }, { name: "Fashion", createdBy: adminId }, { upsert: true, new: true });
    const home = await Category.findOneAndUpdate({ name: "Home" }, { name: "Home", createdBy: adminId }, { upsert: true, new: true });

    // STEP 5: SUBCATEGORIES
    console.log("Adding SubCategories...");
    await SubCategory.findOneAndUpdate({ name: "Mobile Phones" }, { name: "Mobile Phones", category: electronics._id, createdBy: adminId }, { upsert: true });
    await SubCategory.findOneAndUpdate({ name: "Laptops" }, { name: "Laptops", category: electronics._id, createdBy: adminId }, { upsert: true });
    await SubCategory.findOneAndUpdate({ name: "Men's Wear" }, { name: "Men's Wear", category: fashion._id, createdBy: adminId }, { upsert: true });

    // STEP 6: BRANDS
    console.log("Adding Brands...");
    await Brand.findOneAndUpdate({ name: "Samsung" }, { name: "Samsung", createdBy: adminId }, { upsert: true });
    await Brand.findOneAndUpdate({ name: "Nike" }, { name: "Nike", createdBy: adminId }, { upsert: true });
    await Brand.findOneAndUpdate({ name: "Sony" }, { name: "Sony", createdBy: adminId }, { upsert: true });

    // STEP 7: ATTRIBUTES
    console.log("Adding Attributes...");
    const colorAttr = await Attribute.findOneAndUpdate({ name: "Color" }, { name: "Color", fieldType: "select", createdBy: adminId }, { upsert: true, new: true });
    const sizeAttr = await Attribute.findOneAndUpdate({ name: "Size" }, { name: "Size", fieldType: "select", createdBy: adminId }, { upsert: true, new: true });
    await Attribute.findOneAndUpdate({ name: "Weight" }, { name: "Weight", fieldType: "number", createdBy: adminId }, { upsert: true });

    // Associate attributes with categories so they show up in ProductModal
    await Category.findByIdAndUpdate(fashion._id, { $addToSet: { attributes: { $each: [colorAttr._id, sizeAttr._id] } } });
    await Category.findByIdAndUpdate(electronics._id, { $addToSet: { attributes: colorAttr._id } }); // Color for electronics

    // STEP 8: ATTRIBUTE OPTIONS
    console.log("Adding Attribute Options...");
    const colors = ["Red", "Blue", "Black", "White"];
    for (const c of colors) {
      await AttributeOption.findOneAndUpdate({ attribute: colorAttr._id, value: c }, { attribute: colorAttr._id, value: c, createdBy: adminId }, { upsert: true });
    }

    const sizes = ["S", "M", "L", "XL", "XXL"];
    for (const s of sizes) {
      await AttributeOption.findOneAndUpdate({ attribute: sizeAttr._id, value: s }, { attribute: sizeAttr._id, value: s, createdBy: adminId }, { upsert: true });
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
