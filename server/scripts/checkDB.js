import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import path from "path";
import Variant from '../models/variant.js';
import Product from '../models/product.js';
import AttributeOption from '../models/attributeOption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vyntra').then(async () => {
  const p = await Product.findOne({ title: 'MacBook Air' });
  const v = await Variant.find({ product: p._id }).populate('attributes.option');
  console.log('Total Variants:', v.length);
  
  const groups = {};
  v.forEach(variant => {
    variant.attributes.forEach(attr => {
      if(attr.option && attr.option.displayName) {
        groups[attr.option.displayName] = true;
      }
    });
  });
  
  console.log('Options found in DB:', Object.keys(groups));
  
  // Actually, let's delete the anomalous variants for the user right now to fix their issue!
  console.log('Deleting variants that are not part of the standard Apple colors...');
  let deletedCount = 0;
  for (const variant of v) {
    let hasValidColor = false;
    variant.attributes.forEach(attr => {
      if (attr.option && ['Midnight', 'Starlight', 'Silver', 'Sky Blue'].includes(attr.option.displayName)) {
        hasValidColor = true;
      }
    });
    if (!hasValidColor) {
      console.log('Deleting anomalous variant:', variant.sku);
      await Variant.findByIdAndDelete(variant._id);
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} old anomalous variants.`);
  
  process.exit(0);
});
