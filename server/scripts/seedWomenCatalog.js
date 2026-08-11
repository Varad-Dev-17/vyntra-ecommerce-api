import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Product from "../models/product.js";
import Variant from "../models/variant.js";
import Brand from "../models/brand.js";
import Category from "../models/category.js";
import Department from "../models/department.js";
import Attribute from "../models/attribute.js";
import AttributeOption from "../models/attributeOption.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const seedData = [
  {
    brand: "Adidas",
    title: "Women's Sports T-Shirt",
    category: "T-Shirts",
    shortDescription: "Stylish sports T-shirt designed for workouts, running, and active lifestyles.",
    longDescription: "Stylish sports T-shirt designed for workouts, running, and active lifestyles.",
    colors: ["Black", "Pink", "Yellow", "Pastel Green", "Grey"],
    sizes: ["S", "M", "L", "XL"],
    attributes: {
      "Fit": ["Regular Fit"],
      "Sleeve": ["Half Sleeve"],
      "Fabric": ["Polyester"],
      "Pattern": ["Solid"],
      "Neck": ["Round Neck"]
    }
  },
  {
    brand: "Puma",
    title: "Women's Casual T-Shirt",
    category: "T-Shirts",
    shortDescription: "Comfortable and trendy T-shirt perfect for casual outings and everyday wear.",
    longDescription: "Comfortable and trendy T-shirt perfect for casual outings and everyday wear.",
    colors: ["Sky Blue", "Baby Pink", "Lavender", "White", "Black", "Mustard Yellow", "Mint Green", "Peach", "Maroon", "Beige", "Powder Blue", "Rose Pink"],
    sizes: ["S", "M", "L", "XL"],
    attributes: {
      "Fit": ["Regular Fit"],
      "Sleeve": ["Half Sleeve"],
      "Fabric": ["Cotton Blend"],
      "Pattern": ["Graphic Print"],
      "Neck": ["Round Neck"]
    }
  },
  {
    brand: "Aurelia",
    title: "Women's Embroidered Kurta Set",
    category: "Kurti Set",
    shortDescription: "Beautiful embroidered Kurta set for festive and traditional wear.",
    longDescription: "Beautiful embroidered Kurta set for festive and traditional wear. Complete with pant and dupatta.",
    colors: ["Green", "Maroon", "Beige"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    attributes: {
      "Fabric": ["Cotton", "Viscose"],
      "Sleeve": ["3/4 Sleeve", "Full Sleeve"],
      "Pattern": ["Embroidered", "Solid"],
      "Set Includes": ["Kurta", "Pant", "Dupatta"]
    }
  },
  {
    brand: "W for Woman",
    title: "Women's Straight Kurta Suit",
    category: "Kurti Set",
    shortDescription: "Elegant straight kurta suit perfect for casual and work wear.",
    longDescription: "Elegant straight kurta suit perfect for casual and work wear. Features solid and printed designs.",
    colors: ["White", "Navy Blue", "Mustard"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    attributes: {
      "Fabric": ["Cotton Blend", "Rayon"],
      "Sleeve": ["3/4 Sleeve", "Full Sleeve"],
      "Pattern": ["Solid", "Printed"],
      "Neck": ["Round Neck", "V-Neck"]
    }
  },
  {
    brand: "Libas",
    title: "Women's Anarkali Kurta Set",
    category: "Kurti Set",
    shortDescription: "Stunning Anarkali kurta set with floral and printed patterns.",
    longDescription: "Stunning Anarkali kurta set with floral and printed patterns. Set includes Kurta, Pant, and Dupatta.",
    colors: ["Black", "Teal", "Wine"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    attributes: {
      "Fabric": ["Rayon", "Cotton"],
      "Sleeve": ["3/4 Sleeve", "Full Sleeve"],
      "Pattern": ["Floral", "Printed"],
      "Kurta Style": ["Anarkali", "A-Line"],
      "Set Includes": ["Kurta", "Pant", "Dupatta"]
    }
  },
  {
    brand: "ONLY",
    title: "Women's High Rise Skinny Jeans",
    category: "Jeans",
    shortDescription: "Classic high rise skinny jeans for an everyday flattering look.",
    longDescription: "Classic high rise skinny jeans for an everyday flattering look. Stretchy and comfortable denim.",
    colors: ["Blue", "Black", "White"],
    sizes: ["26", "28", "30", "32", "34"],
    attributes: {
      "Fit": ["Skinny", "Slim"],
      "Rise": ["High Rise", "Mid Rise"],
      "Fabric": ["Cotton", "Stretch Denim"],
      "Length": ["Ankle", "Regular"]
    }
  },
  {
    brand: "Pepe Jeans",
    title: "Women's Straight Fit Jeans",
    category: "Jeans",
    shortDescription: "Relaxed straight fit jeans perfect for a casual vibe.",
    longDescription: "Relaxed straight fit jeans perfect for a casual vibe. Durable denim blend.",
    colors: ["Dark Blue", "Light Blue", "Grey"],
    sizes: ["26", "28", "30", "32", "34"],
    attributes: {
      "Fit": ["Straight", "Relaxed"],
      "Rise": ["Mid Rise", "High Rise"],
      "Fabric": ["Denim", "Cotton Blend"],
      "Length": ["Regular", "Cropped"]
    }
  }
];

const generateSlug = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

const getOrCreateBrand = async (name, departmentId) => {
  let brand = await Brand.findOne({ name: new RegExp('^' + name + '$', 'i') });
  if (!brand) {
    brand = new Brand({
      name,
      slug: generateSlug(name),
      departmentIds: [departmentId],
      status: "Active"
    });
    await brand.save();
  } else if (!brand.departmentIds.includes(departmentId)) {
    brand.departmentIds.push(departmentId);
    await brand.save();
  }
  return brand;
};

const getOrCreateCategory = async (name, departmentId) => {
  let category = await Category.findOne({ name: new RegExp('^' + name + '$', 'i') });
  if (!category) {
    category = new Category({
      name,
      slug: generateSlug(name),
      departmentIds: [departmentId],
      status: "Active"
    });
    await category.save();
  } else if (!category.departmentIds.includes(departmentId)) {
    category.departmentIds.push(departmentId);
    await category.save();
  }
  return category;
};

const getOrCreateAttribute = async (name, usage, fieldType = "select") => {
  let attribute = await Attribute.findOne({ name: new RegExp('^' + name + '$', 'i') });
  if (!attribute) {
    attribute = new Attribute({
      name,
      fieldType: name.toLowerCase() === 'color' ? 'color' : fieldType,
      usage,
      status: "Active"
    });
    await attribute.save();
  }
  return attribute;
};

const getOrCreateAttributeOption = async (attributeId, displayName, isColor) => {
  let option = await AttributeOption.findOne({ attribute: attributeId, displayName: new RegExp('^' + displayName + '$', 'i') });
  if (!option) {
    option = new AttributeOption({
      attribute: attributeId,
      displayName,
      storedValue: displayName.toUpperCase().replace(/\s+/g, '_'),
      status: "active"
    });
    if (isColor) {
      // Very basic color mapping fallback
      const colorMap = { "Black": "#000000", "White": "#FFFFFF", "Blue": "#0000FF", "Red": "#FF0000", "Pink": "#FFC0CB" };
      option.hex = colorMap[displayName] || "#CCCCCC"; 
    }
    await option.save();
  }
  return option;
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const dept = await Department.findOne({ name: new RegExp('^women', 'i') });
    if (!dept) {
      throw new Error("Women department not found in DB!");
    }
    const deptId = dept._id;

    const colorAttr = await getOrCreateAttribute("Color", "Variant", "color");
    const sizeAttr = await getOrCreateAttribute("Size", "Variant", "select");

    for (const data of seedData) {
      console.log(`Processing product: ${data.title}...`);

      const productSlug = generateSlug(`${data.brand} ${data.title} ${Math.random().toString(36).substring(7)}`);
      
      const existingProduct = await Product.findOne({ title: data.title });
      if (existingProduct) {
        console.log(`Product "${data.title}" already exists. Skipping duplication.`);
        continue;
      }

      const brand = await getOrCreateBrand(data.brand, deptId);
      const category = await getOrCreateCategory(data.category, deptId);

      const productAttributes = [];
      for (const [attrName, attrValues] of Object.entries(data.attributes)) {
        const attrDoc = await getOrCreateAttribute(attrName, "Product");
        productAttributes.push({
          attribute: attrDoc._id,
          values: attrValues
        });
      }

      const product = new Product({
        productId: `PRD-${Date.now().toString().slice(-6)}`,
        title: data.title,
        slug: productSlug,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        department: deptId,
        category: category._id,
        brand: brand._id,
        attributes: productAttributes,
        status: "Active"
      });

      await product.save();

      // Create variants
      for (const color of data.colors) {
        const colorOption = await getOrCreateAttributeOption(colorAttr._id, color, true);
        
        for (const size of data.sizes) {
          const sizeOption = await getOrCreateAttributeOption(sizeAttr._id, size, false);
          
          const sku = `${brand.name.substring(0,3).toUpperCase()}-${color.substring(0,3).toUpperCase()}-${size.toUpperCase()}-${Math.floor(Math.random()*1000)}`;
          
          const variant = new Variant({
            product: product._id,
            attributes: [
              { attribute: colorAttr._id, option: colorOption._id },
              { attribute: sizeAttr._id, option: sizeOption._id }
            ],
            sku: sku.replace(/\s+/g, ''),
            mrp: 1999,
            price: 1499,
            stock: 50,
            status: "Active"
          });

          await variant.save();
        }
      }
      console.log(`Created product "${data.title}" with ${data.colors.length * data.sizes.length} variants.`);
    }

    console.log("Successfully seeded Women's catalog data!");
    mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Error seeding:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seed();
