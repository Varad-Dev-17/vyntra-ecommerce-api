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

const originalCategories = [
  {"_id":"6a6b27517321e82ced64f445","name":"Laptop","slug":"laptop","status":"Active","createdAt":"2026-07-30T10:28:33.114Z","updatedAt":"2026-07-30T10:28:33.114Z","depts":["Electronics"]},
  {"_id":"6a6b27437321e82ced64f43c","name":"Phone","slug":"phone","status":"Active","createdAt":"2026-07-30T10:28:19.641Z","updatedAt":"2026-07-30T10:28:19.641Z","depts":["Electronics"]},
  {"_id":"6a6b1dde70c12223961d61cc","name":"Kurti Set","slug":"kurti-set","status":"Active","createdAt":"2026-07-30T09:48:14.981Z","updatedAt":"2026-07-30T09:48:14.981Z","depts":["Women", "Womens"]},
  {"_id":"6a69caaf38e0b7b75579856c","name":"Shirts","slug":"shirts","status":"Active","createdAt":"2026-07-29T09:41:03.520Z","updatedAt":"2026-08-06T09:57:59.701Z","depts":["Men", "Women", "Womens"]},
  {"_id":"6a6856127180bc9d7f175023","name":"Bag","slug":"bag","status":"Active","createdAt":"2026-07-28T07:11:14.515Z","updatedAt":"2026-07-28T07:11:14.515Z","depts":["Women", "Womens", "Men"]},
  {"_id":"6a59d950ada871e243a86bfb","name":"T-Shirts","slug":"t-shirts","status":"Active","createdAt":"2026-07-17T07:27:12.022Z","updatedAt":"2026-08-06T09:58:05.088Z","depts":["Men", "Women", "Womens"]}
];

const restoreCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for restoring categories...");

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.name] = d._id;
    });

    await Category.deleteMany({});
    console.log("Cleared newly seeded categories.");

    const formattedCategories = originalCategories.map(cat => {
      const departmentIds = cat.depts
        .map(deptName => deptMap[deptName]) 
        .filter(id => id !== undefined);
        
      return {
        _id: new mongoose.Types.ObjectId(cat._id),
        name: cat.name,
        slug: cat.slug,
        departmentIds,
        status: cat.status,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt)
      };
    });

    await Category.insertMany(formattedCategories);
    console.log("Successfully restored ORIGINAL categories with exact ObjectIDs!");

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error restoring categories:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

restoreCategories();
