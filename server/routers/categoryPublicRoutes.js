import express from "express";
import {
  getCategories,
  getCategory,
  getCategoriesByDepartment,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/department/:departmentId", getCategoriesByDepartment);
router.get("/:id", getCategory);

export default router;
