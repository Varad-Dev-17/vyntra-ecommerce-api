import express from "express";
import {
  getCategories,
  getCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

export default router;
