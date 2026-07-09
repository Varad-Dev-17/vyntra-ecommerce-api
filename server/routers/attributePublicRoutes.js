import express from "express";
import {
  getAttributes,
  getAttribute,
} from "../controllers/attributeController.js";

const router = express.Router();

router.get("/", getAttributes);
router.get("/:id", getAttribute);

export default router;
