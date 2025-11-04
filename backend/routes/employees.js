import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(verifyToken);
router.use(checkRole("HR"));
// CRUD endpoints
router.get("/", getAllEmployees); // Get all employees
router.get("/:id", getEmployeeById); // Get one employee
router.post("/", createEmployee); // Add new employee
router.put("/:id", updateEmployee); // Edit employee
router.delete("/:id", deleteEmployee); // Delete employee

export default router;
