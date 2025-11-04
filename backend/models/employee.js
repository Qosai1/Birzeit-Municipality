import db from "../db/connection.js";

//  Get all employees
class Employee {
  // Method to get all employees
  static async getAll() {
    try {
      const [rows] = await db.query(
        "SELECT * FROM employees WHERE isActive = 1"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Method to get employee by ID
  static async getById(id) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM employees WHERE id = ? AND isActive = 1",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Method to create new employee
  static async create(employeeData) {
    try {
      const {
        fullName,
        email,
        birthDate,
        phoneNumber,
        nationalId,
        address,
        homePhone,
        department,
        salary,
        startDate,
        username,
        password,
        role,
      } = employeeData;

      const [result] = await db.query(
        `INSERT INTO employees
        (fullName, email, birthDate, phoneNumber, nationalId, address,
         homePhone, department, salary, startDate, username, password, role, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          fullName,
          email,
          birthDate,
          phoneNumber,
          nationalId,
          address,
          homePhone,
          department,
          salary,
          startDate,
          username,
          password,
          role,
        ]
      );

      return result.insertId; // Return new employee ID
    } catch (error) {
      throw error;
    }
  }

  // Method to update employee
  static async update(id, employeeData) {
    try {
      const {
        fullName,
        email,
        birthDate,
        phoneNumber,
        nationalId,
        address,
        homePhone,
        department,
        salary,
        startDate,
        role,
      } = employeeData;

      const [result] = await db.query(
        `UPDATE employees
        SET fullName = ?, email = ?, birthDate = ?, phoneNumber = ?,
            nationalId = ?, address = ?, homePhone = ?, department = ?,
            salary = ?, startDate = ?, role = ?
        WHERE id = ?`,
        [
          fullName,
          email,
          birthDate,
          phoneNumber,
          nationalId,
          address,
          homePhone,
          department,
          salary,
          startDate,
          role,
          id,
        ]
      );

      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Method to delete employee (soft delete)
  static async delete(id) {
    try {
      const [result] = await db.query(
        "UPDATE employees SET isActive = 0 WHERE id = ?",
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getByUsername(username) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM employees WHERE username = ? AND isActive = 1",
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default Employee;
