import express from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartControllers.js";
import { identifier } from "../middlewares/identification.js";

const router = express.Router();

router.get("/", identifier, getCart);
router.post("/add", identifier, addToCart);
router.put("/update", identifier, updateQuantity);
router.delete("/remove/:productId", identifier, removeFromCart);
router.delete("/clear", identifier, clearCart);

export default router;
