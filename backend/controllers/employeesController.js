import db from "../db/connection.js";

//  Get all employees
export const getEmployees = (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

//  Get one employee by ID
export const getEmployeeById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Employee not found" });
    res.json(result[0]);
  });
};

// Add new employee
export const addEmployee = (req, res) => {
  const {
    fullName,
    email,
    birthDate,
    phoneNumber,
    nationalId,
    address,
    homePhone,
    age,
    salary,
    startDate,
  } = req.body;
  const sql = `
    INSERT INTO employees (fullName, email, birthDate, phoneNumber, nationalId, address, homePhone, age, salary, startDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    fullName,
    email,
    birthDate,
    phoneNumber,
    nationalId,
    address,
    homePhone,
    age,
    salary,
    startDate,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res
      .status(201)
      .json({ message: "Employee added successfully", id: result.insertId });
  });
};

//  Update employee
export const updateEmployee = (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    birthDate,
    phoneNumber,
    nationalId,
    address,
    homePhone,
    age,
    salary,
    startDate,
  } = req.body;

   const formatDate = (date) => {
    if (!date) return null;
    try {
      return new Date(date).toISOString().split("T")[0]; // => "2025-09-29"
    } catch {
      return null;
    }
  };
  const sql = `
    UPDATE employees SET
    fullName=?, email=?, birthDate=?, phoneNumber=?, nationalId=?, address=?, homePhone=?, age=?, salary=?, startDate=?
    WHERE id=?
  `;
  const values = [
    fullName,
    email,
    formatDate(birthDate),
    phoneNumber,
    nationalId,
    address,
    homePhone,
    age,
    salary,
     formatDate(startDate),
    id,
  ];
console.log("🟡 Received update request for ID:", id);
console.log("🟢 Data received:", req.body);

  db.query(sql, values, (err, result) => {
    if (err) {
    console.error("❌ SQL Error:", err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || err });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee updated successfully" });
  });
};

// Delete employee
export const deleteEmployee = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  });
};
