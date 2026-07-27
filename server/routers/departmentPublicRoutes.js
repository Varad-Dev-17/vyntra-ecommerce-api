import express from "express";
import {
  getDepartments,
  getDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", getDepartments);
router.get("/:id", getDepartment);

export default router;
