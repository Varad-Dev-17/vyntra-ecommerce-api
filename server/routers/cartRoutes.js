import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { identifier } from "../middlewares/identification.js";

const router = express.Router();

// All cart routes require authentication
router.get("/", identifier, getCart);
router.post("/", identifier, addToCart);
router.put("/:id", identifier, updateCartItem);
router.delete("/clear", identifier, clearCart);
router.delete("/:id", identifier, removeFromCart);

export default router;
