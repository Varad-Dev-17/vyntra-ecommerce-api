import express from "express";
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategoryController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", identifier, isAdmin, createSubCategory);
router.put("/:id", identifier, isAdmin, updateSubCategory);
router.delete("/:id", identifier, isAdmin, deleteSubCategory);

export default router;
