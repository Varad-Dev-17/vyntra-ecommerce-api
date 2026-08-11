import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import Attribute from "../models/attribute.js";
import AttributeOption from "../models/attributeOption.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vyntra";

const seedData = [
  {
    attributes: {
      "Fit": ["Regular Fit"],
      "Sleeve": ["Half Sleeve"],
      "Fabric": ["Polyester"],
      "Pattern": ["Solid"],
      "Neck": ["Round Neck"]
    }
  },
  {
    attributes: {
      "Fit": ["Regular Fit"],
      "Sleeve": ["Half Sleeve"],
      "Fabric": ["Cotton Blend"],
      "Pattern": ["Graphic Print"],
      "Neck": ["Round Neck"]
    }
  },
  {
    attributes: {
      "Fabric": ["Cotton", "Viscose"],
      "Sleeve": ["3/4 Sleeve", "Full Sleeve"],
      "Pattern": ["Embroidered", "Solid"],
      "Set Includes": ["Kurta", "Pant", "Dupatta"]
    }
  },
  {
    attributes: {
      "Fabric": ["Cotton Blend", "Rayon"],
      "Sleeve": ["3/4 Sleeve", "Full Sleeve"],
      "Pattern": ["Solid", "Printed"],
      "Neck": ["Round Neck", "V-Neck"]
    }
  },
  {
    attributes: {
      "Fabric": ["Rayon", "Cotton"],
      "Sleeve": ["3/4 Sleeve", "Full Sleeve"],
      "Pattern": ["Floral", "Printed"],
      "Kurta Style": ["Anarkali", "A-Line"],
      "Set Includes": ["Kurta", "Pant", "Dupatta"]
    }
  },
  {
    attributes: {
      "Fit": ["Skinny", "Slim"],
      "Rise": ["High Rise", "Mid Rise"],
      "Fabric": ["Cotton", "Stretch Denim"],
      "Length": ["Ankle", "Regular"]
    }
  },
  {
    attributes: {
      "Fit": ["Straight", "Relaxed"],
      "Rise": ["Mid Rise", "High Rise"],
      "Fabric": ["Denim", "Cotton Blend"],
      "Length": ["Regular", "Cropped"]
    }
  }
];

const fixOptions = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for fixing Attribute Options...");

    let optionsCreated = 0;

    for (const data of seedData) {
      for (const [attrName, attrValues] of Object.entries(data.attributes)) {
        
        // Find the attribute
        const attribute = await Attribute.findOne({ name: new RegExp('^' + attrName + '$', 'i') });
        if (!attribute) continue;

        for (const value of attrValues) {
          // Check if option exists
          const existingOption = await AttributeOption.findOne({ 
            attribute: attribute._id, 
            displayName: new RegExp('^' + value + '$', 'i') 
          });

          if (!existingOption) {
            await AttributeOption.create({
              attribute: attribute._id,
              displayName: value,
              storedValue: value.toUpperCase().replace(/\s+/g, '_'),
              status: "active"
            });
            console.log(`Created missing option: [${attrName}] -> ${value}`);
            optionsCreated++;
          }
        }
      }
    }

    console.log(`Successfully created ${optionsCreated} missing Attribute Options!`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error fixing options:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

fixOptions();
