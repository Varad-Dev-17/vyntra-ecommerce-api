import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  getAdminOrderById,
} from "../controllers/orderController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/stats", identifier, isAdmin, getOrderStats);
router.get("/", identifier, isAdmin, getAllOrders);
router.get("/:id", identifier, isAdmin, getAdminOrderById);
router.put("/:id", identifier, isAdmin, updateOrderStatus);

export default router;
