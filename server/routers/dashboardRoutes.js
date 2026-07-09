import express from "express";
import {
  getDashboardStats,
  getSalesReport,
} from "../controllers/dashboardController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/stats", identifier, isAdmin, getDashboardStats);
router.get("/sales-report", identifier, isAdmin, getSalesReport);

export default router;
