import express from "express";
import {
  createAttributeOption,
  updateAttributeOption,
  deleteAttributeOption,
} from "../controllers/attributeOptionController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", identifier, isAdmin, createAttributeOption);
router.put("/:id", identifier, isAdmin, updateAttributeOption);
router.delete("/:id", identifier, isAdmin, deleteAttributeOption);

export default router;
