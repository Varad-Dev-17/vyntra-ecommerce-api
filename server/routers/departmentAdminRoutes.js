import express from "express";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { identifier } from "../middlewares/identification.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", identifier, isAdmin, createDepartment);
router.put("/:id", identifier, isAdmin, updateDepartment);
router.delete("/:id", identifier, isAdmin, deleteDepartment);

export default router;
