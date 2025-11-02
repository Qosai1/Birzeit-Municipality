import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllEmployees); // Get all employees
router.get("/:id", getEmployeeById); // Get one employee
router.post("/", createEmployee); // Add new employee
router.put("/:id", updateEmployee); // Edit employee
router.delete("/:id", deleteEmployee); // Delete employee

export default router;
