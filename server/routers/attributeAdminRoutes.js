import express from "express";
import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/attributeController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", identifier, isAdmin, createAttribute);
router.put("/:id", identifier, isAdmin, updateAttribute);
router.delete("/:id", identifier, isAdmin, deleteAttribute);

export default router;
