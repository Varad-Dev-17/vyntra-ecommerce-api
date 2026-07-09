import express from "express";
import {
  getSubCategories,
  getSubCategory,
  getSubCategoriesByCategory,
} from "../controllers/subCategoryController.js";

const router = express.Router();

router.get("/", getSubCategories);
router.get("/:id", getSubCategory);
router.get("/category/:categoryId", getSubCategoriesByCategory);

export default router;
