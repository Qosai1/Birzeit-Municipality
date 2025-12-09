import Document, { documentInstance } from "../models/document.js";
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

// ========== Upload File + MeiliSearch + Embeddings ==========
export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

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
    // 1. استخراج النص
    const extractedText = await Document.extractFile(
      filePath,
      file.originalname
    );

    // 2. حفظ في DB
    const newDocId = await Document.create(documentData);

    // 3. جلب الوثيقة
    const doc = await Document.getById(newDocId);

    // 4. إضافة لـ MeiliSearch
    await documentInstance.addToMeiliSearch(doc, extractedText);

    // 5. توليد Embedding (في الخلفية)
    setTimeout(async () => {
      try {
        const fullText = `${title} ${
          description || ""
        } ${extractedText}`.substring(0, 5000);
        if (fullText.trim().length > 0) {
          const embedding = await documentInstance.generateEmbedding(fullText);
          await documentInstance.saveEmbedding(newDocId, embedding);
          console.log(`✓ Embedding generated for document ${newDocId}`);
          console.log("Embedding preview:", embedding.slice(0, 5));
        }
      } catch (err) {
        console.error(`⚠️  Embedding failed for doc ${newDocId}:`, err.message);
      }
    }, 0);

    res.json({
      success: true,
      document_id: newDocId,
      fileName: file.originalname,
      extractedText,
    });

    console.log("✓ Extracted text: ", extractedText.substring(0, 200));
  } catch (error) {
    console.error("❌ File upload error:", error);

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

// ========== البحث النصي ==========
export const searchDocuments = async (req, res) => {
  try {
    const { query, limit, offset, filter } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const results = await documentInstance.search(query, {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
      filter: filter || null,
    });

    res.status(200).json({
      success: true,
      search_type: "text",
      query: query,
      results: results.hits,
      total_hits: results.totalHits,
      processing_time_ms: results.processingTime,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error searching documents",
      error: err.message,
    });
  }
};

// ========== البحث الدلالي ==========
export const semanticSearchDocuments = async (req, res) => {
  try {
    const { query, limit, filter } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    console.log(`🧠 Semantic search: "${query}"`);

    const results = await documentInstance.semanticSearch(query, {
      limit: parseInt(limit) || 20,
      filter: filter || null,
    });

    res.status(200).json({
      success: true,
      search_type: "semantic",
      query: query,
      results: results.hits,
      total_hits: results.totalHits,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error performing semantic search",
      error: err.message,
    });
  }
};

// ========== توليد Embeddings لكل الوثائق ==========
export const generateAllEmbeddings = async (req, res) => {
  try {
    console.log("⏳ Generating embeddings...");
    const count = await documentInstance.generateAllEmbeddings();

    res.status(200).json({
      success: true,
      message: `Generated embeddings for ${count} documents`,
      count: count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error generating embeddings",
      error: err.message,
    });
  }
};
