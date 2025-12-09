import db from "../db/connection.js";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import pdfParse from "pdf-parse-fixed";

class Document {
  static async getAll() {
    try {
      const [rows] = await db.query(
        "SELECT * FROM documents WHERE is_deleted = 0"
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM documents WHERE id = ? and is_deleted = 0",
        [id]
      );
      if (!rows.length) return null;
      const row = rows[0];
      return row;
    } catch (err) {
      throw err;
    }
  }

  static async getAllByDepartment(department) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM documents WHERE department = ? AND is_deleted = 0",
        [department]
      );
      return rows;
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

      const sql = `
      INSERT INTO documents
      (file_name, title, description, file_path, employee_name, employee_id, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
      const [result] = await db.query(sql, [
        file_name,
        title,
        description,
        file_path,
        employee_name,
        employee_id,
        department,
      ]);

      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  // PDF extraction
  static async extractPDF(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const pdf = await pdfParse(buffer);
      return pdf.text || "PDF contains no text.";
    } catch (err) {
      console.error("PDF extraction error:", err);
      throw new Error("Error reading PDF file");
    }
  }

  // Word extraction
  static async extractWord(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "Word file empty";
    } catch (error) {
      console.error("Word extraction error:", error);
      throw new Error("Error reading Word file");
    }
  }

  // image extraction OCR
  static async extractImage(filePath) {
    try {
      const { data } = await Tesseract.recognize(filePath, "ara+eng");
      return data.text || "No text found in image";
    } catch (error) {
      console.error("Image extraction error:", error);
      throw new Error("Error reading image");
    }
  }

  // txt extraction
  static async extractTXT(filePath) {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error("TXT extraction error:", error);

      throw new Error("Error reading TXT");
    }
  }

  // json extraction
  static async extractJSON(filePath) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("JSON extraction error:", error);
      throw new Error("Error reading JSON");
    }
  }

  // csv extraction
  static async extractCSV(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const records = parse(content, { columns: true });
      return JSON.stringify(records, null, 2);
    } catch (error) {
      console.error("CSV extraction error:", error);
      throw new Error("Error reading CSV");
    }
  }

  // xlsx extraction
  static async extractXLSX(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("XLSX extraction error:", error);
      throw new Error("Error reading XLSX");
    }
  }

  static async extractFile(filePath, filename) {
    const ext = path.extname(filename).toLowerCase();

    if (ext === ".pdf") return await this.extractPDF(filePath);
    if (ext === ".doc" || ext === ".docx")
      return await this.extractWord(filePath);
    if ([".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff"].includes(ext))
      return await this.extractImage(filePath);
    if (ext === ".txt") return this.extractTXT(filePath);
    if (ext === ".json") return this.extractJSON(filePath);
    if (ext === ".csv") return this.extractCSV(filePath);
    if (ext === ".xlsx" || ext === ".xls") return this.extractXLSX(filePath);

    return "Unsupported file type";
  }

  static async softDelete(id) {
    try {
      const [result] = await db.query(
        "UPDATE documents SET is_deleted = 1 WHERE id = ?",
        [id]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
}

export default Document;
