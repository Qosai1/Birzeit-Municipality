import Document from "../models/document.js";
import FileExtractorService from "../services/FileExtractorService.js";
import { embeddingService } from "../services/EmbeddingService.js";
import { elasticsearchService } from "../services/ElasticsearchService.js";
import fs from "fs";

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

// ========== Upload File + Embeddings ==========
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
    // 1. Extract text from file
    const extractedText = await FileExtractorService.extractFile(
      filePath,
      file.originalname
    );

    // 2. Save document to database
    const newDocId = await Document.create(documentData);

    // 3. Retrieve the created document
    const doc = await Document.getById(newDocId);

    // 4. Generate embedding asynchronously (in background)
    setTimeout(async () => {
      try {
        const fullText = `${title} ${
          description || ""
        } ${extractedText}`.substring(0, 5000);
        if (fullText.trim().length > 0) {
          await embeddingService.generateAndSaveEmbedding(
            newDocId,
            fullText,
            {
              title: title,
              description: description,
              file_name: file.originalname,
              department: department,
              employee_id: employee_id,
              created_at: doc.created_at,
            }
          );
          console.log(
            `✓ Embedding generated and saved to Elasticsearch for document ${newDocId}`
          );
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

// ========== Text Search (Removed - MeiliSearch deleted) ==========
export const searchDocuments = async (req, res) => {
  res.status(410).json({
    success: false,
    message: "Text search endpoint has been removed. Please use semantic search instead.",
    alternative_endpoint: "/api/documents/search/semantic",
  });
};

// ========== Semantic Search ==========
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

    // Parse filter if provided (expects JSON string)
    let parsedFilter = null;
    if (filter) {
      try {
        parsedFilter = typeof filter === "string" ? JSON.parse(filter) : filter;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid filter format. Expected JSON string.",
          error: err.message,
        });
      }
    }

    // Generate embedding for the query
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Perform semantic search
    const results = await elasticsearchService.semanticSearch(queryEmbedding, {
      limit: parseInt(limit) || 20,
      filter: parsedFilter,
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

// ========== Semantic Search by Department ==========
export const semanticSearchByDepartment = async (req, res) => {
  try {
    const { query, limit } = req.query;
    const { department } = req.params;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    if (!department || department.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    console.log(
      `🧠 Semantic search by department: "${query}" in "${department}"`
    );

    // Generate embedding for the query
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Perform semantic search
    const results = await elasticsearchService.semanticSearch(queryEmbedding, {
      limit: parseInt(limit) || 20,
      filter: { department: department },
    });

    res.status(200).json({
      success: true,
      search_type: "semantic",
      query: query,
      department: department,
      results: results.hits,
      total_hits: results.totalHits,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error performing semantic search by department",
      error: err.message,
    });
  }
};

// ========== Generate Embeddings for All Documents ==========
export const generateAllEmbeddings = async (req, res) => {
  try {
    console.log("⏳ Generating embeddings...");
    const count = await embeddingService.generateAllEmbeddings();

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
