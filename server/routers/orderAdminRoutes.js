import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  getAdminOrderById,
  updateOrderItemStatus,
} from "../controllers/orderController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/stats", identifier, isAdmin, getOrderStats);
router.get("/", identifier, isAdmin, getAllOrders);
router.get("/:id", identifier, isAdmin, getAdminOrderById);
router.put("/:id", identifier, isAdmin, updateOrderStatus);
router.patch("/:id/item-status", identifier, isAdmin, updateOrderItemStatus);

export default router;
