import express from "express";
import { adminSignIn } from "../controllers/adminController.js";

const router = express.Router();

router.post("/signin", adminSignIn);

export default router;
