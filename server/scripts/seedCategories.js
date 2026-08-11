import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Category from "../models/category.js";
import Department from "../models/department.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const categoriesData = [
  // Men
  { name: "T-Shirts", slug: "t-shirts", depts: ["Men", "Kids"] },
  { name: "Shirts", slug: "shirts", depts: ["Men", "Kids"] },
  { name: "Jeans", slug: "jeans", depts: ["Men", "Womens", "Women", "Kids"] },
  { name: "Trousers", slug: "trousers", depts: ["Men", "Womens", "Women"] },
  { name: "Suits", slug: "suits", depts: ["Men"] },
  { name: "Kurta Sets", slug: "kurta-sets", depts: ["Men"] },
  { name: "Sneakers", slug: "sneakers", depts: ["Men", "Womens", "Women", "Kids"] },
  { name: "Watches", slug: "watches", depts: ["Men", "Womens", "Women"] },
  
  // Women
  { name: "Dresses", slug: "dresses", depts: ["Womens", "Women", "Kids"] },
  { name: "Tops", slug: "tops", depts: ["Womens", "Women", "Kids"] },
  { name: "Sarees", slug: "sarees", depts: ["Womens", "Women"] },
  { name: "Kurtas & Suits", slug: "kurtas-and-suits", depts: ["Womens", "Women"] },
  { name: "Heels", slug: "heels", depts: ["Womens", "Women"] },
  { name: "Flats", slug: "flats", depts: ["Womens", "Women"] },
  { name: "Handbags", slug: "handbags", depts: ["Womens", "Women"] },
  { name: "Jewellery", slug: "jewellery", depts: ["Womens", "Women"] },

  // Electronics
  { name: "Laptops", slug: "laptops", depts: ["Electronics"] },
  { name: "Smartphones", slug: "smartphones", depts: ["Electronics"] },
  { name: "Headphones", slug: "headphones", depts: ["Electronics"] },
  { name: "Cameras", slug: "cameras", depts: ["Electronics"] },
  { name: "Smart Watches", slug: "smart-watches", depts: ["Electronics"] },
  
  // Home & Living
  { name: "Bedsheets", slug: "bedsheets", depts: ["Home & Living"] },
  { name: "Curtains", slug: "curtains", depts: ["Home & Living"] },
  { name: "Cushions", slug: "cushions", depts: ["Home & Living"] },
  { name: "Lamps & Lighting", slug: "lamps-and-lighting", depts: ["Home & Living"] },
  { name: "Cookware", slug: "cookware", depts: ["Home & Living"] },

  // Beauty
  { name: "Makeup", slug: "makeup", depts: ["Beauty & Personal Care", "Beauty"] },
  { name: "Skincare", slug: "skincare", depts: ["Beauty & Personal Care", "Beauty"] },
  { name: "Fragrances", slug: "fragrances", depts: ["Beauty & Personal Care", "Beauty", "Men", "Womens", "Women"] },
  { name: "Haircare", slug: "haircare", depts: ["Beauty & Personal Care", "Beauty"] },
  
  // Sports
  { name: "Activewear", slug: "activewear", depts: ["Sports & Outdoors", "Sports", "Men", "Womens", "Women"] },
  { name: "Sports Shoes", slug: "sports-shoes", depts: ["Sports & Outdoors", "Sports", "Men", "Womens", "Women"] },
  { name: "Fitness Equipment", slug: "fitness-equipment", depts: ["Sports & Outdoors", "Sports"] },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding categories...");

    // Fetch all departments
    const departments = await Department.find();
    if (departments.length === 0) {
      console.log("No departments found! Please run seedDepartments.js first.");
      process.exit(1);
    }

    // Create a map of department names to IDs
    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.name] = d._id;
    });

    await Category.deleteMany({});
    console.log("Cleared existing categories.");

    const formattedCategories = categoriesData.map(cat => {
      const departmentIds = cat.depts
        .map(deptName => deptMap[deptName]) 
        .filter(id => id !== undefined);
        
      return {
        name: cat.name,
        slug: cat.slug,
        departmentIds,
        status: "Active"
      };
    });

    await Category.insertMany(formattedCategories);
    console.log("Successfully seeded categories!");

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedCategories();
