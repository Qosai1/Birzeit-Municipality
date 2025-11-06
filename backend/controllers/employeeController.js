import Employee from "../models/employee.js";
import bcrypt from "bcrypt";

// GET ALL EMPLOYEES
export const getAllEmployees = async (req, res) => {
  try {
    // Call model to get data
    const employees = await Employee.getAll();

    // Send success response
    res.status(200).json(employees);
  } catch (error) {
    // Send error response
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};

// GET EMPLOYEE BY ID
export const getEmployeeById = async (req, res) => {
  try {
    // Get ID from URL parameters
    const id = req.params.id;

    // Call model
    const employee = await Employee.getById(id);

    // Check if employee exists
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Send success response
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

// CREATE NEW EMPLOYEE
export const createEmployee = async (req, res) => {
  try {
    // Validate required fields
    const { username, password, fullName, email } = req.body;

    if (!username || !password || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Required fields: username, password, fullName, email",
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare employee data
    const employeeData = {
      ...req.body,
      password: hashedPassword,
    };

    // Call model to create employee
    const employeeId = await Employee.create(employeeData);

    // Send success response
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        id: employeeId,
        username: username,
      },
    });
  } catch (error) {
    // Handle duplicate username error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

// UPDATE EMPLOYEE
export const updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if employee exists
    const existingEmployee = await Employee.getById(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Call model to update
    const affectedRows = await Employee.update(id, req.body);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found or no changes made",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
    });
  }
};

// DELETE EMPLOYEE (Soft Delete)
export const deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;

    // Call model to delete
    const affectedRows = await Employee.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message,
    });
  }
};



// Login Employee

export const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const employee = await Employee.getByUsername(username);

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const { password: _, username: __, ...safeEmployee } = employee;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeEmployee,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};
