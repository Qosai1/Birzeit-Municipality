import db from "../db/connection.js";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import pdfParse from "pdf-parse-fixed";
import { pipeline } from "@xenova/transformers";
import elasticClient, {
  testConnection,
  initializeEmbeddingsIndex,
} from "../db/elasticsearch.js";

class Document {
  constructor() {
    this.elasticIndexName = "document_embeddings";
    this.embedder = null;
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.elasticInitialized = false;
  }

  // ========== Elasticsearch Initialization ==========
  async initializeElasticsearch() {
    if (this.elasticInitialized) return true;

    try {
      const connected = await testConnection();
      if (!connected) {
        console.warn(
          "⚠️  Elasticsearch is not available. Semantic search will be disabled."
        );
        return false;
      }

      await initializeEmbeddingsIndex();
      this.elasticInitialized = true;
      console.log("✓ Elasticsearch initialized for embeddings");
      return true;
    } catch (err) {
      console.warn("⚠️  Elasticsearch initialization error:", err.message);
      console.warn("   Semantic search will be disabled.");
      return false;
    }
  }

  // ========== Document ID Generation ==========

  /**
   * Generate unique document ID
   * @returns {number} Unique document ID
   */
  static generateDocumentId() {
    // Use timestamp + random number to ensure uniqueness
    return Date.now() + Math.floor(Math.random() * 1000000);
  }

  // ========== Elasticsearch Document Operations ==========

  /**
   * Get all documents from Elasticsearch
   * @returns {Promise<Array>} Array of documents
   */
  static async getAll() {
    try {
      const documentInstance = new Document();
      const initialized = await documentInstance.initializeElasticsearch();

      if (!initialized) {
        console.warn("⚠️  Elasticsearch not available. Cannot retrieve documents.");
        return [];
      }

      const response = await elasticClient.search({
        index: documentInstance.elasticIndexName,
        body: {
          query: {
            match_all: {}
          },
          size: 10000, // Get all documents (adjust if needed)
        }
      });

      const documents = response.hits.hits.map(hit => ({
        id: hit._source.document_id || null,
        title: hit._source.title || "",
        description: hit._source.description || "",
        file_name: hit._source.file_name || "",
        file_path: hit._source.file_path || "",
        employee_name: hit._source.employee_name || "",
        employee_id: hit._source.employee_id || null,
        department: hit._source.department || "",
        created_at: hit._source.created_at || new Date().toISOString(),
        updated_at: hit._source.updated_at || new Date().toISOString(),
      }));

      return documents;
    } catch (err) {
      console.error("✗ Error getting all documents from Elasticsearch:", err.message);
      throw err;
    }
  }

  /**
   * Get document by ID from Elasticsearch
   * @param {number} id - Document ID
   * @returns {Promise<Object|null>} Document or null if not found
   */
  static async getById(id) {
    try {
      const documentInstance = new Document();
      const initialized = await documentInstance.initializeElasticsearch();

      if (!initialized) {
        console.warn(`⚠️  Elasticsearch not available. Cannot retrieve document ${id}.`);
        return null;
      }

      const response = await elasticClient.get({
        index: documentInstance.elasticIndexName,
        id: id.toString(),
      });

      if (!response.found) {
        return null;
      }

      const source = response._source;
      return {
        id: source.document_id || null,
        title: source.title || "",
        description: source.description || "",
        file_name: source.file_name || "",
        file_path: source.file_path || "",
        employee_name: source.employee_name || "",
        employee_id: source.employee_id || null,
        department: source.department || "",
        created_at: source.created_at || new Date().toISOString(),
        updated_at: source.updated_at || new Date().toISOString(),
        extracted_text: source.extracted_text || "",
      };
    } catch (err) {
      // If document not found, return null (not an error)
      if (err.meta?.statusCode === 404) {
        return null;
      }
      console.error("✗ Error getting document from Elasticsearch:", err.message);
      return null;
    }
  }

  /**
   * Get all documents by department from Elasticsearch
   * @param {string} department - Department name
   * @returns {Promise<Array>} Array of documents
   */
  static async getAllByDepartment(department) {
    try {
      const documentInstance = new Document();
      const initialized = await documentInstance.initializeElasticsearch();

      if (!initialized) {
        console.warn("⚠️  Elasticsearch not available. Cannot retrieve documents.");
        return [];
      }

      const response = await elasticClient.search({
        index: documentInstance.elasticIndexName,
        body: {
          query: {
            term: {
              department: department
            }
          },
          size: 10000, // Get all documents (adjust if needed)
        }
      });

      const documents = response.hits.hits.map(hit => ({
        id: hit._source.document_id || null,
        title: hit._source.title || "",
        description: hit._source.description || "",
        file_name: hit._source.file_name || "",
        file_path: hit._source.file_path || "",
        employee_name: hit._source.employee_name || "",
        employee_id: hit._source.employee_id || null,
        department: hit._source.department || "",
        created_at: hit._source.created_at || new Date().toISOString(),
        updated_at: hit._source.updated_at || new Date().toISOString(),
      }));

      return documents;
    } catch (err) {
      console.error("✗ Error getting documents by department from Elasticsearch:", err.message);
      throw err;
    }
  }

  /**
   * Create document (validate employee and return ID for Elasticsearch storage)
   * Note: Actual storage happens in Elasticsearch via saveFullDocumentToElasticsearch
   * @param {Object} documentData - Document data
   * @returns {Promise<number>} Generated document ID
   */
  static async create(documentData) {
    try {
      const { employee_id } = documentData;

      // Validate employee exists (still check MySQL for employee validation)
      const [empRows] = await db.query(
        "SELECT id FROM employees WHERE id = ?",
        [employee_id]
      );
      if (!empRows.length) throw new Error("Employee ID does not exist");

      // Generate unique document ID
      const documentId = Document.generateDocumentId();

      // Note: Document is stored in Elasticsearch, not MySQL
      return documentId;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete document from Elasticsearch (soft delete - actual deletion)
   * @param {number} id - Document ID
   * @returns {Promise<Object>} Result object with success status
   */
  static async softDelete(id) {
    try {
      const documentInstance = new Document();
      const deleted = await documentInstance.deleteFromElasticsearch(id);

      return {
        affectedRows: deleted ? 1 : 0,
        success: deleted
      };
    } catch (err) {
      console.error("✗ Error deleting document:", err.message);
      return {
        affectedRows: 0,
        success: false
      };
    }
  }

  // ========== Elasticsearch Document Operations ==========

  /**
   * Delete document from Elasticsearch
   * @param {number} documentId - Document ID
   * @returns {Promise<boolean>}
   */
  async deleteFromElasticsearch(documentId) {
    try {
      // Ensure Elasticsearch is initialized
      const initialized = await this.initializeElasticsearch();
      if (!initialized) {
        console.warn(
          `⚠️  Cannot delete document ${documentId} from Elasticsearch: Elasticsearch not available`
        );
        return false;
      }

      await elasticClient.delete({
        index: this.elasticIndexName,
        id: documentId.toString(),
        refresh: true, // Make deletion immediately visible
      });

      console.log(
        `✓ Document ${documentId} deleted from Elasticsearch`
      );
      return true;
    } catch (err) {
      // If document not found, it's already deleted - not an error
      if (err.meta?.statusCode === 404) {
        console.log(
          `ℹ Document ${documentId} not found in Elasticsearch (already deleted)`
        );
        return true;
      }
      console.error(
        "✗ Error deleting document from Elasticsearch:",
        err.message
      );
      return false;
    }
  }

  /**
   * Save full document with extracted text and embedding to Elasticsearch
   * @param {number} documentId - Document ID
   * @param {Array<number>} embedding - Embedding vector
   * @param {string} extractedText - Extracted text from document
   * @param {Object} documentMetadata - Document metadata
   * @returns {Promise<boolean>}
   */
  async saveFullDocumentToElasticsearch(documentId, embedding, extractedText, documentMetadata = {}) {
    try {
      // Ensure Elasticsearch is initialized
      const initialized = await this.initializeElasticsearch();
      if (!initialized) {
        console.warn(
          `⚠️  Cannot save document ${documentId} to Elasticsearch: Elasticsearch not available`
        );
        return false;
      }

      // Validate embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Embedding must be a non-empty array");
      }

      // Prepare full document for Elasticsearch
      const doc = {
        document_id: documentId,
        embedding: embedding,
        title: documentMetadata.title || "",
        description: documentMetadata.description || "",
        file_name: documentMetadata.file_name || "",
        file_path: documentMetadata.file_path || "",
        employee_name: documentMetadata.employee_name || "",
        department: documentMetadata.department || "",
        employee_id: documentMetadata.employee_id || null,
        extracted_text: extractedText || "",
        created_at: documentMetadata.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Use document_id as the document ID in Elasticsearch
      await elasticClient.index({
        index: this.elasticIndexName,
        id: documentId.toString(),
        body: doc,
        refresh: true, // Make it immediately searchable
      });

      console.log(
        `✓ Full document saved to Elasticsearch for document ${documentId} (${embedding.length} dimensions)`
      );
      return true;
    } catch (err) {
      console.error("✗ Error saving full document to Elasticsearch:", err.message);
      return false;
    }
  }

  //  File Text Extraction

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

  //  AI Model & Embeddings
  async initializeEmbedder() {
    if (!this.embedder) {
      console.log("⏳ Loading AI model...");
      this.embedder = await pipeline(
        "feature-extraction",
        "Xenova/multilingual-e5-small"
      );
      console.log("✓ AI model loaded");
    }
  }

  async generateEmbedding(text) {
    try {
      await this.initializeEmbedder();

      if (!text || text.trim().length === 0) {
        throw new Error("Text cannot be empty");
      }

      const cleanedText = text.trim().substring(0, 5000);

      const output = await this.embedder(cleanedText, {
        pooling: "mean",
        normalize: true,
      });

      return Array.from(output.data);
    } catch (err) {
      console.error("✗ Embedding error:", err.message);
      throw err;
    }
  }

  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) {
      throw new Error("Invalid vectors for similarity calculation");
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  async saveEmbedding(documentId, embedding, documentMetadata = {}) {
    try {
      // Ensure Elasticsearch is initialized
      const initialized = await this.initializeElasticsearch();
      if (!initialized) {
        console.warn(
          `⚠️  Cannot save embedding for document ${documentId}: Elasticsearch not available`
        );
        return false;
      }

      // Validate embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Embedding must be a non-empty array");
      }

      if (embedding.length !== 384) {
        console.warn(
          `⚠️  Embedding dimension mismatch: expected 384, got ${embedding.length}`
        );
      }

      // Prepare document for Elasticsearch (now includes extracted_text if provided)
      const doc = {
        document_id: documentId,
        embedding: embedding,
        title: documentMetadata.title || "",
        description: documentMetadata.description || "",
        file_name: documentMetadata.file_name || "",
        file_path: documentMetadata.file_path || "",
        employee_name: documentMetadata.employee_name || "",
        department: documentMetadata.department || "",
        employee_id: documentMetadata.employee_id || null,
        extracted_text: documentMetadata.extracted_text || "",
        created_at: documentMetadata.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Use document_id as the document ID in Elasticsearch
      await elasticClient.index({
        index: this.elasticIndexName,
        id: documentId.toString(),
        body: doc,
        refresh: true, // Make it immediately searchable
      });

      console.log(
        `✓ Embedding saved to Elasticsearch for document ${documentId} (${embedding.length} dimensions)`
      );
      return true;
    } catch (err) {
      console.error("✗ Error saving embedding to Elasticsearch:", err.message);
      return false;
    }
  }

  async getEmbedding(documentId) {
    try {
      // Ensure Elasticsearch is initialized
      const initialized = await this.initializeElasticsearch();
      if (!initialized) {
        return null;
      }

      const response = await elasticClient.get({
        index: this.elasticIndexName,
        id: documentId.toString(),
      });

      if (!response.found) {
        return null;
      }

      return response._source.embedding;
    } catch (err) {
      // If document not found, return null (not an error)
      if (err.meta?.statusCode === 404) {
        return null;
      }
      console.error(
        "✗ Error getting embedding from Elasticsearch:",
        err.message
      );
      return null;
    }
  }

  async generateAllEmbeddings() {
    try {
      console.log("⏳ Generating embeddings for all documents...");

      const documents = await Document.getAll();
      let processed = 0;

      for (const doc of documents) {
        const existingEmbedding = await this.getEmbedding(doc.id);
        if (existingEmbedding) {
          console.log(`⏭️  Document ${doc.id} already has embedding`);
          continue;
        }

        let extractedText = "";
        if (doc.file_path && fs.existsSync(doc.file_path)) {
          try {
            extractedText = await Document.extractFile(
              doc.file_path,
              doc.file_name
            );
          } catch (err) {
            console.error(`Error extracting ${doc.file_name}:`, err.message);
            continue;
          }
        }

        const fullText =
          `${doc.title} ${doc.description} ${extractedText}`.substring(0, 5000);

        if (fullText.trim().length === 0) {
          console.log(`⏭  Document ${doc.id} has no text`);
          continue;
        }

        const embedding = await this.generateEmbedding(fullText);

        // Pass document metadata for Elasticsearch
        await this.saveEmbedding(doc.id, embedding, {
          title: doc.title,
          description: doc.description,
          file_name: doc.file_name,
          department: doc.department,
          employee_id: doc.employee_id,
          created_at: doc.created_at,
        });

        processed++;
        console.log(
          `✓ [${processed}/${documents.length}] Generated embedding for document ${doc.id}`
        );
      }

      console.log(` Generated embeddings for ${processed} documents`);
      return processed;
    } catch (err) {
      console.error("✗ Error generating embeddings:", err.message);
      throw err;
    }
  }

  async semanticSearch(query, options = {}) {
    try {
      console.log(` Semantic search for: "${query}"`);

      // Ensure Elasticsearch is initialized
      const initialized = await this.initializeElasticsearch();
      if (!initialized) {
        throw new Error(
          "Elasticsearch is not available. Please start Elasticsearch to use semantic search."
        );
      }

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Build filter clauses for KNN query
      const filterClauses = [];

      // Add filters if provided
      if (options.filter) {
        if (options.filter.department) {
          // Support both single department and array of departments
          if (Array.isArray(options.filter.department)) {
            filterClauses.push({
              terms: { department: options.filter.department },
            });
          } else {
            filterClauses.push({
              term: { department: options.filter.department },
            });
          }
        }
        if (options.filter.employee_id) {
          filterClauses.push({
            term: { employee_id: options.filter.employee_id },
          });
        }
      }

      // Vector similarity search using knn
      const knnQuery = {
        field: "embedding",
        query_vector: queryEmbedding,
        k: options.limit || 20,
        num_candidates: (options.limit || 20) * 10, // Search more candidates for better results
      };

      // Add filters to KNN query if any (filters must be inside knn object in ES 8.x+)
      if (filterClauses.length > 0) {
        if (filterClauses.length === 1) {
          knnQuery.filter = filterClauses[0];
        } else {
          knnQuery.filter = {
            bool: {
              must: filterClauses,
            },
          };
        }
      }

      // Build the search request
      const searchBody = {
        knn: knnQuery,
        size: options.limit || 20,
      };

      // Perform vector search in Elasticsearch
      const response = await elasticClient.search({
        index: this.elasticIndexName,
        body: searchBody,
      });

      // Format results
      const hits = response.hits.hits.map((hit) => {
        const source = hit._source;
        return {
          id: source.document_id,
          title: source.title,
          description: source.description,
          file_name: source.file_name,
          department: source.department,
          employee_id: source.employee_id,
          semanticScore: hit._score, // Elasticsearch similarity score
        };
      });

      console.log(
        `✅ Returned ${
          hits.length
        } semantic results from Elasticsearch (avg score: ${(
          hits.reduce((sum, r) => sum + r.semanticScore, 0) / hits.length || 0
        ).toFixed(3)})`
      );

      return {
        hits: hits,
        totalHits: response.hits.total.value,
        query,
        searchType: "semantic",
      };
    } catch (err) {
      console.error("✗ Semantic search error:", err.message);
      throw err;
    }
  }
}

const documentInstance = new Document();

export default Document;
export { documentInstance };
