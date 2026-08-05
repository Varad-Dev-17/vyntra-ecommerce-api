import express from "express";
import {
  getReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { identifier } from "../middlewares/identification.js";

const router = express.Router();

// Protected user route (must come before /:productId to prevent route collision)
router.get("/my/all", identifier, getUserReviews);

// Public route
router.get("/:productId", getReviews);

// Protected routes (authenticated users only)
router.post("/:productId", identifier, createReview);
router.put("/:reviewId", identifier, updateReview);
router.delete("/:reviewId", identifier, deleteReview);

export default router;
