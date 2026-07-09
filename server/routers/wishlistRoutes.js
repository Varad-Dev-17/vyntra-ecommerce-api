import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus,
} from "../controllers/wishlistController.js";
import { identifier } from "../middlewares/identification.js";

const router = express.Router();

// All wishlist routes require authentication
router.get("/", identifier, getWishlist);
router.post("/", identifier, addToWishlist);
router.delete("/clear", identifier, clearWishlist);
router.get("/check/:productId", identifier, checkWishlistStatus);
router.delete("/:productId", identifier, removeFromWishlist);

export default router;
