import express from "express";
import {
  getBrands,
  getBrand,
  getBrandsByDepartment,
} from "../controllers/brandController.js";

const router = express.Router();

router.get("/", getBrands);
router.get("/department/:departmentId", getBrandsByDepartment);
router.get("/:id", getBrand);

export default router;
