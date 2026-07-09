import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", identifier, isAdmin, createCategory);
router.put("/:id", identifier, isAdmin, updateCategory);
router.delete("/:id", identifier, isAdmin, deleteCategory);

export default router;
