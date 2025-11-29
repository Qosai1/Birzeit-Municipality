import Document from "../models/document.js";
import fs from "fs";
import { createRequire } from "module";

// Fix for pdf-parse CommonJS import
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.getAll();
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: err.message,
    });
  }
};

export const getAllDocumentsByDepartment = async (req, res) => {
  try {
    const department = req.params.department;
    const documents = await Document.getAllByDepartment(department);
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: err.message,
    });
  }
};

// get document by id
export const getDocumentById = async (req, res) => {
  try {
    const id = req.params.id;
    const document = await Document.getById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    res.status(200).json(document);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching document",
      error: err.message,
    });
  }
};

// create new document
export const createDocument = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const file = req.file;

    const { title, description, employee_name, employee_id, department } =
      req.body;

    const documentData = {
      file_name: file.originalname,
      file_path: file.path,
      title,
      description,
      employee_name,
      employee_id,
      department,
    };

    const newDocId = await Document.create(documentData);

    res.status(201).json({
      success: true,
      message: "Document created successfully",
      document_id: newDocId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// SOFT DELETE document
export const softDeleteDocument = async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await Document.softDelete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document soft-deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error soft-deleting document",
      error: err.message,
    });
  }
};

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const file = req.file;

  const filePath = file.path;

  const { title, description, employee_name, employee_id, department } =
    req.body;

  const documentData = {
    file_name: file.originalname,
    file_path: filePath,
    title,
    description,
    employee_name,
    employee_id,
    department,
  };

  try {
    const extractedText = await Document.extractFile(
      filePath,
      req.file.originalname
    );

    await Document.create(documentData);

    res.json({
      success: true,
      fileName: req.file.originalname,
      extractedText,
    });
    console.log("extracted text: ", extractedText);
  } catch (error) {
    console.error("File upload error:", error);

    // Clean up file even if there's an error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(500).json({
      success: false,
      error: "Error processing file",
      message: error.message,
    });
  }
};
