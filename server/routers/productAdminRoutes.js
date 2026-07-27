import express from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductVariants,
  getProductVariants,
} from "../controllers/productController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Protected admin routes
router.get("/", identifier, isAdmin, getAllProducts);
router.get("/:id", identifier, isAdmin, getProductById);
router.post("/", identifier, isAdmin, addProduct);
router.put("/:id", identifier, isAdmin, updateProduct);
router.get("/:id/variants", identifier, isAdmin, getProductVariants);
router.put("/:id/variants", identifier, isAdmin, updateProductVariants);
router.delete("/:id", identifier, isAdmin, deleteProduct);

export default router;
