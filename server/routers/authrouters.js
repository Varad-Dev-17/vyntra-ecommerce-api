import express from "express";
import {
  signIn,
  signUp,
  verifyVerificationCode,
  signOut,
  changePassword,
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
  // getByName,
} from "../controllers/authcontrollers.js";

import { identifier } from "../middlewares/identification.js";

const router = express.Router();

// Public routes
router.post("/signup", signUp);
router.patch("/verify-verification-code", verifyVerificationCode);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.patch("/send-forgot-password-code", sendForgotPasswordCode);
router.patch("/verify-forgot-password-code", verifyForgotPasswordCode);

// Protected routes
router.patch("/change-password", identifier, changePassword);
// router.get("/get-by-name/:username", identifier, getByName);

export default router;
