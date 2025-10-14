import express from "express";
import {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeesController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getEmployees); // Get all employees
router.get("/:id", getEmployeeById); // Get one employee
router.post("/", addEmployee); // Add new employee
router.put("/:id", updateEmployee); // Edit employee
router.delete("/:id", deleteEmployee); // Delete employee

export default router;
