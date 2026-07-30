import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from "../controllers/orderController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/stats", identifier, isAdmin, getOrderStats);
router.get("/", identifier, isAdmin, getAllOrders);
router.put("/:id", identifier, isAdmin, updateOrderStatus);

export default router;
