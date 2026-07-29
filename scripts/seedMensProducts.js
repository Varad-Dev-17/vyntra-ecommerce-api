import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

import Department from "../server/models/department.js";
import Category from "../server/models/category.js";
import Brand from "../server/models/brand.js";
import Attribute from "../server/models/attribute.js";
import AttributeOption from "../server/models/attributeOption.js";
import AttributeMapping from "../server/models/attributeMapping.js";
import Product from "../server/models/product.js";
import Variant from "../server/models/variant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to slugify
const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

const getOrCreateDoc = async (Model, query, defaultData) => {
  let doc = await Model.findOne(query);
  if (!doc) {
    doc = new Model({ ...query, ...defaultData });
    await doc.save();
  }
  return doc;
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Drop legacy index if it exists
    await mongoose.connection.collection('products').dropIndex('colors.sizes.sku_1').catch(() => {});

    const dataPath = path.join(process.cwd(), "mens_products.json");
    const productsData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    for (const item of productsData) {
      console.log(`\nProcessing: ${item.title}`);

      // 1. Department
      const dept = await getOrCreateDoc(Department, { name: item.department }, { slug: slugify(item.department) });

      // 2. Category
      let cat = await Category.findOne({ name: item.category });
      if (!cat) {
        cat = new Category({ name: item.category, slug: slugify(item.category), departmentIds: [dept._id] });
        await cat.save();
      } else if (!cat.departmentIds.includes(dept._id)) {
        cat.departmentIds.push(dept._id);
        await cat.save();
      }

      // 3. Brand
      let brand = await Brand.findOne({ name: item.brand });
      if (!brand) {
        brand = new Brand({ name: item.brand, slug: slugify(item.brand), departmentIds: [dept._id] });
        await brand.save();
      } else if (!brand.departmentIds.includes(dept._id)) {
        brand.departmentIds.push(dept._id);
        await brand.save();
      }

      // 4. Product Attributes & Mapping
      const productAttributesData = [];
      for (const [attrName, attrValue] of Object.entries(item.attributes)) {
        let attribute = await getOrCreateDoc(Attribute, { name: attrName }, { fieldType: "select", usage: "Product" });
        if (!attribute.categoryIds.includes(cat._id)) {
          attribute.categoryIds.push(cat._id);
          await attribute.save();
        }
        await getOrCreateDoc(AttributeMapping, { category: cat._id, attribute: attribute._id }, {});
        
        // Create AttributeOption for the product attribute so it appears in the admin UI
        await getOrCreateDoc(AttributeOption, { attribute: attribute._id, displayName: attrValue }, { storedValue: slugify(attrValue) });
        
        productAttributesData.push({ attribute: attribute._id, values: [attrValue] });
      }

      // 5. Product
      let product = await Product.findOne({ title: item.title });
      if (!product) {
        product = new Product({
          title: item.title,
          slug: slugify(item.title + "-" + Date.now()),
          shortDescription: item.shortDescription,
          longDescription: item.longDescription,
          department: dept._id,
          category: cat._id,
          brand: brand._id,
          attributes: productAttributesData,
          status: "Active"
        });
        await product.save();
        console.log(`Created Product: ${product.title}`);
      } else {
        // If product already exists, update its attributes array
        product.attributes = productAttributesData;
        await product.save();
        console.log(`Updated Product Attributes: ${product.title}`);
      }

      // 6. Variant Attributes (Color & Size)
      const colorAttr = await getOrCreateDoc(Attribute, { name: "Color" }, { fieldType: "color", usage: "Variant" });
      if (!colorAttr.categoryIds.includes(cat._id)) {
        colorAttr.categoryIds.push(cat._id);
        await colorAttr.save();
      }
      await getOrCreateDoc(AttributeMapping, { category: cat._id, attribute: colorAttr._id }, {});

      const sizeAttr = await getOrCreateDoc(Attribute, { name: "Size" }, { fieldType: "select", usage: "Variant" });
      if (!sizeAttr.categoryIds.includes(cat._id)) {
        sizeAttr.categoryIds.push(cat._id);
        await sizeAttr.save();
      }
      await getOrCreateDoc(AttributeMapping, { category: cat._id, attribute: sizeAttr._id }, {});

      // 7. Create Variants (Every combination of Color and Size)
      // Map images to format
      const formattedImages = item.images.map(url => ({ url, publicId: "local-" + Date.now() }));
      const mainImage = formattedImages.length > 0 ? formattedImages[0] : null;

      for (const color of item.colors) {
        const colorOpt = await getOrCreateDoc(AttributeOption, { attribute: colorAttr._id, displayName: color }, { storedValue: slugify(color), hex: "#000000" });
        
        for (const size of item.sizes) {
          const sizeOpt = await getOrCreateDoc(AttributeOption, { attribute: sizeAttr._id, displayName: size }, { storedValue: size });

          const sku = `${slugify(item.brand).substring(0,3).toUpperCase()}-${slugify(item.category).substring(0,3).toUpperCase()}-${slugify(color).substring(0,3).toUpperCase()}-${size}-${Date.now().toString().slice(-4)}`;
          
          const variantExists = await Variant.findOne({ product: product._id, "attributes.option": { $all: [colorOpt._id, sizeOpt._id] } });
          
          if (!variantExists) {
            const variant = new Variant({
              product: product._id,
              attributes: [
                { attribute: colorAttr._id, option: colorOpt._id },
                { attribute: sizeAttr._id, option: sizeOpt._id }
              ],
              sku: sku,
              mrp: item.price + 500, // Make MRP slightly higher
              price: item.price,
              stock: item.stock,
              status: "Active",
              mainImage: mainImage,
              galleryImages: formattedImages
            });
            await variant.save();
          }
        }
      }
      console.log(`Created Variants for ${item.title}`);
    }

    console.log("\nSeeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
