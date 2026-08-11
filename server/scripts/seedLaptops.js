import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Department from "../models/department.js";
import Category from "../models/category.js";
import Brand from "../models/brand.js";
import Attribute from "../models/attribute.js";
import AttributeOption from "../models/attributeOption.js";
import AttributeMapping from "../models/attributeMapping.js";
import Product from "../models/product.js";
import Variant from "../models/variant.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const laptopData = [
  {
    brand: "HP",
    title: "Pavilion 15 Laptop",
    colors: ["Natural Silver", "Blue", "Black"],
    attributes: {
      RAM: ["8GB", "16GB"],
      Storage: ["512GB SSD", "1TB SSD"],
      Processor: ["Intel Core i5", "Intel Core i7"],
      "Display Size": ["14-inch", "15.6-inch"],
      "Operating System": ["Windows 11"]
    }
  },
  {
    brand: "Lenovo",
    title: "IdeaPad Slim 5",
    colors: ["Arctic Grey", "Cloud Grey", "Abyss Blue"],
    attributes: {
      RAM: ["8GB", "16GB", "32GB"],
      Storage: ["512GB SSD", "1TB SSD"],
      Processor: ["AMD Ryzen 5", "AMD Ryzen 7"],
      "Display Size": ["14-inch", "15.6-inch"],
      "Operating System": ["Windows 11"]
    }
  },
  {
    brand: "ASUS",
    title: "VivoBook 15",
    colors: ["Cool Silver", "Quiet Blue", "Indie Black"],
    attributes: {
      RAM: ["8GB", "16GB"],
      Storage: ["512GB SSD", "1TB SSD"],
      Processor: ["Intel Core i5", "Intel Core i7"],
      "Display Size": ["14-inch", "15.6-inch"],
      "Operating System": ["Windows 11"]
    }
  },
  {
    brand: "Apple",
    title: "MacBook Air",
    colors: ["Midnight", "Starlight", "Silver", "Sky Blue", "Black"],
    attributes: {
      RAM: ["8GB", "16GB", "24GB"],
      Storage: ["256GB SSD", "512GB SSD", "1TB SSD"],
      Processor: ["Apple M4"],
      "Display Size": ["13.6-inch", "15.3-inch"],
      "Operating System": ["macOS"]
    }
  }
];

const getOrCreateBrand = async (name, departmentId) => {
  let brand = await Brand.findOne({ name: new RegExp('^' + name + '$', 'i') });
  if (!brand) {
    brand = new Brand({
      name,
      slug: name.toLowerCase().replace(/\\s+/g, '-'),
      departmentIds: [departmentId],
      status: "Active"
    });
    await brand.save();
    console.log(`Created brand: ${name}`);
  } else if (!brand.departmentIds.includes(departmentId)) {
    brand.departmentIds.push(departmentId);
    await brand.save();
  }
  return brand;
};

const getOrCreateAttribute = async (name, usage = "Product") => {
  let attribute = await Attribute.findOne({ name: new RegExp('^' + name + '$', 'i') });
  if (!attribute) {
    attribute = new Attribute({
      name,
      description: `${name} options`,
      fieldType: "select",
      isRequired: true,
      usage,
      status: "Active"
    });
    await attribute.save();
    console.log(`Created attribute: ${name} (${usage})`);
  } else {
    // If usage was mismatched but we need it, you might update it, but let's assume it's fine
  }
  return attribute;
};

const getOrCreateAttributeOption = async (attributeId, displayName, isColor) => {
  let option = await AttributeOption.findOne({ attribute: attributeId, displayName: new RegExp('^' + displayName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '$', 'i') });
  if (!option) {
    option = new AttributeOption({
      attribute: attributeId,
      displayName,
      storedValue: displayName.toUpperCase().replace(/\\s+/g, '_'),
      status: "active"
    });
    if (isColor) {
      // Basic color mapping
      const colorMap = {
        "Natural Silver": "#c0c0c0", "Blue": "#0000ff", "Black": "#000000",
        "Arctic Grey": "#7a7a7a", "Cloud Grey": "#a9a9a9", "Abyss Blue": "#0a1b3f",
        "Cool Silver": "#b0c4de", "Quiet Blue": "#4682b4", "Indie Black": "#1c1c1c",
        "Midnight": "#191970", "Starlight": "#f8f8ff", "Silver": "#c0c0c0", "Sky Blue": "#87ceeb"
      };
      option.colorCode = colorMap[displayName] || "#000000";
    }
    await option.save();
  }
  return option;
};

const ensureAttributeMapping = async (categoryId, attributeId) => {
  const mapping = await AttributeMapping.findOne({ category: categoryId, attribute: attributeId });
  if (!mapping) {
    await AttributeMapping.create({ category: categoryId, attribute: attributeId });
  }
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Electronics Seeding...");

    const elecDept = await Department.findOne({ name: new RegExp('^electronics$', 'i') });
    if (!elecDept) throw new Error("Electronics department not found");

    const laptopCat = await Category.findOne({ name: new RegExp('^laptop$', 'i'), departmentIds: elecDept._id });
    if (!laptopCat) throw new Error("Laptop category not found");

    // Pre-create Attributes
    const colorAttr = await getOrCreateAttribute("Color", "Variant");
    const ramAttr = await getOrCreateAttribute("RAM", "Variant");
    const storageAttr = await getOrCreateAttribute("Storage", "Variant");
    const processorAttr = await getOrCreateAttribute("Processor", "Product");
    const displaySizeAttr = await getOrCreateAttribute("Display Size", "Product");
    const osAttr = await getOrCreateAttribute("Operating System", "Product");

    await ensureAttributeMapping(laptopCat._id, colorAttr._id);
    await ensureAttributeMapping(laptopCat._id, ramAttr._id);
    await ensureAttributeMapping(laptopCat._id, storageAttr._id);
    await ensureAttributeMapping(laptopCat._id, processorAttr._id);
    await ensureAttributeMapping(laptopCat._id, displaySizeAttr._id);
    await ensureAttributeMapping(laptopCat._id, osAttr._id);

    for (const data of laptopData) {
      const brand = await getOrCreateBrand(data.brand, elecDept._id);

      // Create AttributeOptions for Product-level attributes (to ensure Admin panel dropdowns work)
      for (const [attrName, attrValues] of Object.entries(data.attributes)) {
        if (['Processor', 'Display Size', 'Operating System'].includes(attrName)) {
          const attrDoc = await Attribute.findOne({ name: new RegExp('^' + attrName + '$', 'i') });
          for (const val of attrValues) {
            await getOrCreateAttributeOption(attrDoc._id, val, false);
          }
        }
      }

      // Build product-level attributes (storing the storedValue, NOT displayName)
      const productAttributes = [];
      for (const [attrName, attrValues] of Object.entries(data.attributes)) {
        if (['Processor', 'Display Size', 'Operating System'].includes(attrName)) {
          const attrDoc = await Attribute.findOne({ name: new RegExp('^' + attrName + '$', 'i') });
          const storedValues = [];
          for (const val of attrValues) {
            const opt = await getOrCreateAttributeOption(attrDoc._id, val, false);
            storedValues.push(opt.storedValue);
          }
          productAttributes.push({ attribute: attrDoc._id, values: storedValues });
        }
      }

      let product = await Product.findOne({ title: data.title });
      
      if (!product) {
        console.log(`Creating NEW product: ${data.title}`);
        product = new Product({
          title: data.title,
          slug: data.title.toLowerCase().replace(/\\s+/g, '-'),
          shortDescription: `Premium ${data.title} by ${data.brand}`,
          longDescription: `Experience the power of the ${data.title}. Designed by ${data.brand} for ultimate performance.`,
          status: "Active",
          department: elecDept._id,
          category: laptopCat._id,
          brand: brand._id,
          attributes: productAttributes,
          returnPolicy: { returnable: true, exchangeable: true, returnDays: 14 }
        });
        await product.save();
      } else {
        console.log(`UPDATING EXISTING product: ${data.title}`);
        product.department = elecDept._id;
        product.category = laptopCat._id;
        product.brand = brand._id;
        product.attributes = productAttributes;
        product.status = "Active";
        await product.save();
      }

      // Generate Variants based on combinations (Color x RAM x Storage)
      const rams = data.attributes.RAM;
      const storages = data.attributes.Storage;
      
      let variantsCreated = 0;
      for (const color of data.colors) {
        const colorOption = await getOrCreateAttributeOption(colorAttr._id, color, true);
        
        for (const ram of rams) {
          const ramOption = await getOrCreateAttributeOption(ramAttr._id, ram, false);
          
          for (const storage of storages) {
            const storageOption = await getOrCreateAttributeOption(storageAttr._id, storage, false);
            
            const sku = `${brand.name.toUpperCase().substring(0,3)}-${product.title.replace(/\\s+/g, '').substring(0,5).toUpperCase()}-${colorOption.storedValue.substring(0,3)}-${ramOption.storedValue}-${storageOption.storedValue}`;
            
            let variant = await Variant.findOne({ product: product._id, sku });
            if (!variant) {
              // Calculate a dummy price
              let basePrice = brand.name === 'Apple' ? 1200 : 700;
              if (ram.includes('16')) basePrice += 200;
              if (ram.includes('24') || ram.includes('32')) basePrice += 400;
              if (storage.includes('1TB')) basePrice += 200;

              variant = new Variant({
                product: product._id,
                sku,
                status: "Active",
                stock: Math.floor(Math.random() * 50) + 10,
                mrp: basePrice + 300,
                price: basePrice,
                gstRate: 18,
                attributes: [
                  { attribute: colorAttr._id, option: colorOption._id },
                  { attribute: ramAttr._id, option: ramOption._id },
                  { attribute: storageAttr._id, option: storageOption._id }
                ]
              });
              await variant.save();
              variantsCreated++;
            }
          }
        }
      }
      console.log(`Generated ${variantsCreated} new variants for ${data.title}`);
    }

    console.log("Electronics catalog successfully seeded!");
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
    process.exit(1);
  }
};

seed();
