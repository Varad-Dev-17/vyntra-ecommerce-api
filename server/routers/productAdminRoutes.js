import express from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductVariants,
  getProductVariants,
  getAllVariantGroups,
} from "../controllers/productController.js";
import { getVariantGroupAnalytics } from "../controllers/variantAnalyticsController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", identifier, isAdmin, getAllProducts);
router.get("/variants/groups", identifier, isAdmin, getAllVariantGroups);
router.get("/:id", identifier, isAdmin, getProductById);
router.post("/", identifier, isAdmin, addProduct);
router.put("/:id", identifier, isAdmin, updateProduct);
router.get("/:id/variants", identifier, isAdmin, getProductVariants);
router.get("/:id/variant-group/:primaryOptionId/analytics", identifier, isAdmin, getVariantGroupAnalytics);
router.put("/:id/variants", identifier, isAdmin, updateProductVariants);
router.delete("/:id", identifier, isAdmin, deleteProduct);

export default router;
