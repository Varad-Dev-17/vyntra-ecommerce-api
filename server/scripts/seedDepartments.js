import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Department from "../models/department.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const seedData = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories",
    iconName: "Monitor",
    status: "Active"
  },
  {
    name: "Womens",
    slug: "womens",
    description: "Women's clothing and fashion",
    iconName: "UserRound",
    status: "Active"
  },
  {
    name: "Men",
    slug: "men",
    description: "Men's clothing and accessories",
    iconName: "Shirt",
    status: "Active"
  },
  {
    name: "Kids",
    slug: "kids",
    description: "Kids clothing, toys and essentials",
    iconName: "Baby",
    status: "Active"
  },
  {
    name: "Home & Living",
    slug: "home-and-living",
    description: "Home decor, furniture and more",
    iconName: "Armchair",
    status: "Active"
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-and-personal-care",
    description: "Beauty, skincare and grooming",
    iconName: "Sparkles",
    status: "Active"
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-and-outdoors",
    description: "Sports gear and outdoor essentials",
    iconName: "Dribbble",
    status: "Active"
  }
];

const seedDepartments = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await Department.deleteMany({});
    console.log("Cleared existing departments.");

    await Department.insertMany(seedData);
    console.log("Successfully seeded departments!");

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding departments:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedDepartments();
