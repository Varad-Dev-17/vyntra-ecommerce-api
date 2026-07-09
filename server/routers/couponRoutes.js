import express from "express";
import {
  getAllCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Public route
router.post("/validate", validateCoupon);

// Admin routes
router.get("/", identifier, isAdmin, getAllCoupons);
router.get("/:id", identifier, isAdmin, getCouponById);
router.post("/", identifier, isAdmin, createCoupon);
router.put("/:id", identifier, isAdmin, updateCoupon);
router.delete("/:id", identifier, isAdmin, deleteCoupon);

export default router;
