import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Variant from "../server/models/variant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

// ==========================================
// CONFIGURATION
// ==========================================
// The GST rate applied to all historical products in the database.
// This is necessary because the new schema requires a strict GST enum.
const DEFAULT_MIGRATION_GST_RATE = 18;
// ==========================================

const migrateGSTRates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for GST Migration.");

    // Find all variants that do NOT have a gstRate field
    const variants = await Variant.find({ gstRate: { $exists: false } });

    if (variants.length === 0) {
      console.log("No variants require GST migration. All set!");
      process.exit(0);
    }

    console.log(`Found ${variants.length} variants missing a GST rate. Migrating...`);

    let updatedCount = 0;
    for (const variant of variants) {
      variant.gstRate = DEFAULT_MIGRATION_GST_RATE;
      await variant.save();
      updatedCount++;
    }

    console.log(`Successfully migrated ${updatedCount} variants with a GST rate of ${DEFAULT_MIGRATION_GST_RATE}%.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateGSTRates();
