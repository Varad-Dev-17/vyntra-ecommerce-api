import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  getNewArrivals,
} from "../controllers/productController.js";

const router = express.Router();

const getActiveProducts = async (req, res, next) => {
  req.query.status = "Active";
  return getAllProducts(req, res, next);
};

// Public routes
router.get("/", getActiveProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);
router.get("/related/:id", getRelatedProducts);

export default router;
