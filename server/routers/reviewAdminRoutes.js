import express from "express";
import {
  getAllAdminReviews,
  deleteAdminReview,
} from "../controllers/reviewController.js";
import { identifier } from "../middlewares/identification.js";

const router = express.Router();

router.get("/", identifier, getAllAdminReviews);
router.delete("/:reviewId", identifier, deleteAdminReview);

export default router;
