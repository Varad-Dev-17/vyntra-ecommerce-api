import express from "express";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Protected admin routes
router.get("/", identifier, isAdmin, getAllProducts);
router.post("/", identifier, isAdmin, addProduct);
router.put("/:id", identifier, isAdmin, updateProduct);
router.delete("/:id", identifier, isAdmin, deleteProduct);

export default router;
