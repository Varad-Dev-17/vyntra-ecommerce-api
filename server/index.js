import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authrouters from "./routers/authrouters.js";
import adminRouters from "./routers/adminRouters.js";
import uploadRouter from "./routers/uploadRouters.js";
import productRoutes from "./routers/productRouters.js";
import cartRouter from "./routers/cartRouters.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

// ============================================
// API Routes FIRST (before static/catch-all)
// ============================================
app.use("/auth", authrouters);
app.use("/admin", adminRouters);
app.use("/upload", uploadRouter);
app.use("/products", productRoutes);

// ============================================
// Cart Routes
// ============================================
app.use("/cart", cartRouter);

// ============================================
// Static Files & Catch-All
// ============================================
const distPath = path.join(__dirname, "../vyntra/dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Catch-all for SPA routing - only for non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`MongoDB connected`);
  });
};

startServer();
