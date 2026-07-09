import express from "express";
import {
  getAttributeOptions,
  getOptionsByAttribute,
} from "../controllers/attributeOptionController.js";

const router = express.Router();

router.get("/", getAttributeOptions);
router.get("/attribute/:attributeId", getOptionsByAttribute);

export default router;
