import express from "express";
import Product from "../models/product.js"; // adjust path to your Product model

const router = express.Router();

// GET /products - Public: Get all active products 
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: "active" }; // only show active products

    if (category && category !== "All") {
      filter.categories = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
});

// GET /products/categories - Get all unique categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("categories");
    res.status(200).json({
      success: true,
      categories: ["All", ...categories],
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
});

export default router;
