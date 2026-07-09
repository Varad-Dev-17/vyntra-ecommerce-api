import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routers/authroutes.js";
import adminRoutes from "./routers/adminRoutes.js";
import userRoutes from "./routers/userRoutes.js";

// Split routes
import productPublicRoutes from "./routers/productPublicRoutes.js";
import productAdminRoutes from "./routers/productAdminRoutes.js";
import categoryPublicRoutes from "./routers/categoryPublicRoutes.js";
import categoryAdminRoutes from "./routers/categoryAdminRoutes.js";
import subCategoryPublicRoutes from "./routers/subCategoryPublicRoutes.js";
import subCategoryAdminRoutes from "./routers/subCategoryAdminRoutes.js";
import brandPublicRoutes from "./routers/brandPublicRoutes.js";
import brandAdminRoutes from "./routers/brandAdminRoutes.js";
import attributePublicRoutes from "./routers/attributePublicRoutes.js";
import attributeAdminRoutes from "./routers/attributeAdminRoutes.js";
import attributeOptionPublicRoutes from "./routers/attributeOptionPublicRoutes.js";
import attributeOptionAdminRoutes from "./routers/attributeOptionAdminRoutes.js";
import orderPublicRoutes from "./routers/orderPublicRoutes.js";
import orderAdminRoutes from "./routers/orderAdminRoutes.js";

// Single-purpose routes
import reviewRoutes from "./routers/reviewRoutes.js";
import wishlistRoutes from "./routers/wishlistRoutes.js";
import couponRoutes from "./routers/couponRoutes.js";
import uploadRoutes from "./routers/uploadRoutes.js";
import cartRoutes from "./routers/cartRoutes.js";
import dashboardRoutes from "./routers/dashboardRoutes.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

// API Routes

// Admin only
app.use("/admin", adminRoutes); // Keep standard /admin routes (e.g. signin)
app.use("/admin/users", userRoutes);
app.use("/admin/products", productAdminRoutes);
app.use("/admin/categories", categoryAdminRoutes);
app.use("/admin/subcategories", subCategoryAdminRoutes);
app.use("/admin/brands", brandAdminRoutes);
app.use("/admin/attributes", attributeAdminRoutes);
app.use("/admin/attribute-options", attributeOptionAdminRoutes);
app.use("/admin/orders", orderAdminRoutes);
app.use("/admin/coupons", couponRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/admin/upload", uploadRoutes);

// Public / User routes
app.use("/auth", authRoutes);
app.use("/products", productPublicRoutes);
app.use("/categories", categoryPublicRoutes);
app.use("/subcategories", subCategoryPublicRoutes);
app.use("/brands", brandPublicRoutes);
app.use("/attributes", attributePublicRoutes);
app.use("/attribute-options", attributeOptionPublicRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/reviews", reviewRoutes);
app.use("/orders", orderPublicRoutes);

// Static Files
const distPath = path.join(__dirname, "../vyntra/dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("MongoDB Connected");
  });
};

startServer();
