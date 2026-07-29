import express from "express";
import { identifier } from "../middlewares/identification.js";
import {
  createReturnRequest,
  getMyReturnRequests,
} from "../controllers/returnRequestController.js";

const router = express.Router();

router.post("/", identifier, createReturnRequest);
router.get("/my-requests", identifier, getMyReturnRequests);

export default router;
