import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'public/home');
const files = [
  'iphone.jpg', 
  'shoes_banner.jpg', 
  'pink_sweater.jpg', 
  'shopping_bags.jpg', 
  'spring_couple.jpg'
];

async function processFiles() {
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - not found`);
      continue;
    }
    
    console.log(`Processing ${file}...`);
    const tempPath = path.join(dir, 'temp_' + file);
    
    try {
      await sharp(filePath)
        .resize(1920, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(tempPath);
        
      fs.renameSync(tempPath, filePath);
      console.log(`Optimized ${file} successfully.`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
}

processFiles();
