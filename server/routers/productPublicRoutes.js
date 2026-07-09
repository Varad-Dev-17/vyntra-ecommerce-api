import express from "express";
import {
  getAllProducts,
  getProductById,
  getAttributesByCategory,
  getRelatedProducts,
} from "../controllers/productController.js";

const router = express.Router();

const getActiveProducts = async (req, res, next) => {
  req.query.status = "active";
  return getAllProducts(req, res, next);
};

// Public routes
router.get("/", getActiveProducts);
router.get("/:id", getProductById);
router.get("/attributes/:categoryId", getAttributesByCategory);
router.get("/related/:id", getRelatedProducts);

export default router;
