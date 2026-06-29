import express from "express";
import {
  adminSignIn,
  getAllUsers,
  makeAdmin,
  removeAdmin,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  deleteUser,
  toggleUserStatus,
} from "../controllers/adminControllers.js";

import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Public
router.post("/signin", adminSignIn);
// ==================== USER MANAGEMENT ====================
router.get("/all-users", identifier, isAdmin, getAllUsers);
router.patch("/make-admin/:userId", identifier, isAdmin, makeAdmin);
router.patch("/remove-admin/:userId", identifier, isAdmin, removeAdmin);
router.delete("/users/:id", identifier, isAdmin, deleteUser);
router.put("/users/:id/toggle-status", identifier, isAdmin, toggleUserStatus);

// ==================== PRODUCTS CRUD ====================
router.get("/products", identifier, isAdmin, getAllProducts);
router.get("/products/:id", identifier, isAdmin, getProductById);
router.post("/products", identifier, isAdmin, addProduct);
router.put("/products/:id", identifier, isAdmin, updateProduct);
router.delete("/products/:id", identifier, isAdmin, deleteProduct);

// ==================== ORDERS ====================
router.get("/orders", identifier, isAdmin, getAllOrders);
router.put("/orders/:id/status", identifier, isAdmin, updateOrderStatus);

export default router;
