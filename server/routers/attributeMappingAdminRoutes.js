import express from "express";
import {
  getMappedAttributes,
  getAvailableAttributes,
  mapAttributes,
  unmapAttribute,
} from "../controllers/attributeMappingController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/:id/attributes", identifier, isAdmin, getMappedAttributes);
router.get("/:id/available-attributes", identifier, isAdmin, getAvailableAttributes);
router.post("/:id/attributes", identifier, isAdmin, mapAttributes);
router.delete("/:id/attributes/:attributeId", identifier, isAdmin, unmapAttribute);

export default router;
