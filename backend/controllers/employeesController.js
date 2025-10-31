import db from "../db/connection.js";
import bcrypt from "bcrypt";

// ===============================
//  Get all employees
// ===============================
export const getEmployees = (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ===============================
//  Get one employee by ID
// ===============================
export const getEmployeeById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Employee not found" });
    res.json(result[0]);
  });
};

// ===============================
//  Add new employee
// ===============================
export const addEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      department,
      birthDate,
      phoneNumber,
      nationalId,
      address,
      homePhone,
      salary,
      startDate,
      username,
      password,
      role,
    } = req.body;

    // 🔐 تشفير كلمة المرور قبل الحفظ
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO employees 
      (fullName, email, department, birthDate, phoneNumber, nationalId, address, homePhone, salary, startDate, username, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      fullName,
      email,
      department,
      birthDate,
      phoneNumber,
      nationalId,
      address,
      homePhone,
      salary,
      startDate,
      username,
      hashedPassword,
      role,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ SQL Error:", err.sqlMessage || err);
        return res.status(500).json({ error: err.sqlMessage || err });
      }
      res.status(201).json({
        message: "Employee added successfully",
        id: result.insertId,
      });
    });
  } catch (error) {
    console.error("❌ Add employee error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===============================
//  Update employee
// ===============================
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    department,
    birthDate,
    phoneNumber,
    nationalId,
    address,
    homePhone,
    salary,
    startDate,
    username,
    password,
    role,
  } = req.body;

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  try {
    // 🔐 إذا تم إرسال باسورد جديد، نشفره
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const sql = `
      UPDATE employees SET
      fullName=?, email=?, department=?, birthDate=?, phoneNumber=?, nationalId=?, 
      address=?, homePhone=?, salary=?, startDate=?, username=?, 
      ${hashedPassword ? "password=?," : ""} role=? 
      WHERE id=?
    `;

    const values = [
      fullName,
      email,
      department,
      formatDate(birthDate),
      phoneNumber,
      nationalId,
      address,
      homePhone,
      salary,
      formatDate(startDate),
      username,
    ];

    if (hashedPassword) values.push(hashedPassword);
    values.push(role, id);

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ SQL Error:", err.sqlMessage || err);
        return res.status(500).json({ error: err.sqlMessage || err });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Employee not found" });

      res.json({ message: "Employee updated successfully" });
    });
  } catch (error) {
    console.error("❌ Update employee error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===============================
//  Delete employee
// ===============================
export const deleteEmployee = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  });
};

// ===============================
//  Search employees (autocomplete)
// ===============================


export const searchEmployees = (req, res) => {
  const { search } = req.query;
  const query = `
    SELECT id, fullName FROM employees 
    WHERE fullName LIKE ?
    LIMIT 10
  `;
  db.query(query, [`%${search}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

