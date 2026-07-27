import express from "express";
import {
  getAttributes,
  getAttribute,
  getAttributesByCategory,
} from "../controllers/attributeController.js";

const router = express.Router();

router.get("/", getAttributes);
router.get("/category/:categoryId", getAttributesByCategory);
router.get("/:id", getAttribute);

export default router;
