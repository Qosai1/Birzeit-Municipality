import Employee from "../models/employee.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// login employee
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const employee = await Employee.getByUsername(username);

    if (!employee) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: employee.id, username: employee.username, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token: token,
      employee: {
        id: employee.id,
        username: employee.username,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const employee = await Employee.getById(req.user.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user info without password
    const { password, ...userInfo } = employee;

    res.status(200).json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user information",
      error: error.message,
    });
  }
};
