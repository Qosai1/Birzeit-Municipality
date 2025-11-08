import db from "../db/connection.js";
import moment from "moment-timezone";

class Document {
  static async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM documents");
      return rows.map((row) => ({
        ...row,
        uploaded_at: moment(row.uploaded_at)
          .tz("Asia/Jerusalem")
          .format("YYYY-MM-DD HH:mm:ss"),
      }));
    } catch (err) {
      throw err;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM documents WHERE id = ?", [
        id,
      ]);
      if (!rows.length) return null;
      const row = rows[0];
      row.uploaded_at = moment(row.uploaded_at)
        .tz("Asia/Jerusalem")
        .format("YYYY-MM-DD HH:mm:ss");
      return row;
    } catch (err) {
      throw err;
    }
  }

  static async create(documentData) {
    try {
      const {
        file_name,
        title,
        description,
        file_path,
        employee_name,
        employee_id,
        department,
      } = documentData;

      const [empRows] = await db.query(
        "SELECT id FROM employees WHERE id = ?",
        [employee_id]
      );
      if (!empRows.length) throw new Error("Employee ID does not exist");

      const palestineTime = moment()
        .tz("Asia/Jerusalem")
        .format("YYYY-MM-DD HH:mm:ss");

      const sql = `
        INSERT INTO documents
        (file_name, title, description, file_path, employee_name, employee_id, department, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        file_name,
        title,
        description,
        file_path,
        employee_name,
        employee_id,
        department,
        palestineTime,
      ]);

      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, documentData) {
    try {
      const {
        file_name,
        title,
        description,
        file_path,
        employee_name,
        employee_id,
        department,
      } = documentData;

      const [empRows] = await db.query(
        "SELECT id FROM employees WHERE id = ?",
        [employee_id]
      );
      if (!empRows.length) throw new Error("Employee ID does not exist");

      const sql = `
        UPDATE documents SET
          file_name = ?,
          title = ?,
          description = ?,
          file_path = ?,
          employee_name = ?,
          employee_id = ?,
          department = ?
        WHERE id = ?
      `;
      const [result] = await db.query(sql, [
        file_name,
        title,
        description,
        file_path,
        employee_name,
        employee_id,
        department,
        id,
      ]);

      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM documents WHERE id = ?", [
        id,
      ]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

export default Document;
