import express from "express";
import {
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", identifier, isAdmin, createBrand);
router.put("/:id", identifier, isAdmin, updateBrand);
router.delete("/:id", identifier, isAdmin, deleteBrand);

export default router;
