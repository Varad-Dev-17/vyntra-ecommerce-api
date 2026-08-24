import express from "express";
import {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  initRazorpayOrder,
} from "../controllers/orderController.js";
import { identifier } from "../middlewares/identification.js";

const router = express.Router();

router.get("/my-orders", identifier, getUserOrders);
router.post("/razorpay/init", identifier, initRazorpayOrder);
router.post("/", identifier, createOrder);
router.get("/:id", identifier, getOrderById);
router.put("/cancel/:id", identifier, cancelOrder);

export default router;
