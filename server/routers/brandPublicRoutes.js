import express from "express";
import {
  getBrands,
  getBrand,
} from "../controllers/brandController.js";

const router = express.Router();

router.get("/", getBrands);
router.get("/:id", getBrand);

export default router;
