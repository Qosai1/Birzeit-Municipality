import db from "../db/connection.js";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import pdfParse from "pdf-parse-fixed";
import { MeiliSearch } from "meilisearch";
import { pipeline } from "@xenova/transformers";
import elasticClient, {
  testConnection,
  initializeEmbeddingsIndex,
} from "../db/elasticsearch.js";

class Document {
  constructor() {
    this.meiliClient = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
      apiKey: process.env.MEILISEARCH_API_KEY || "masterKey",
    });
    this.indexName = "documents";
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
        console.warn("   Text search (MeiliSearch) will still work.");
        return false;
      }

      await initializeEmbeddingsIndex();
      this.elasticInitialized = true;
      console.log("✓ Elasticsearch initialized for embeddings");
      return true;
    } catch (err) {
      console.warn("⚠️  Elasticsearch initialization error:", err.message);
      console.warn(
        "   Semantic search will be disabled, but text search will still work."
      );
      return false;
    }
  }

  //  MeiliSearch Initialization
  async initializeMeiliSearch() {
    try {
      try {
        await this.meiliClient.getIndex(this.indexName);
        console.log("✓ MeiliSearch index exists");
      } catch (err) {
        await this.meiliClient.createIndex(this.indexName, {
          primaryKey: "id",
        });
        console.log("✓ MeiliSearch index created");
      }

      const index = this.meiliClient.index(this.indexName);
      await index.updateSettings({
        searchableAttributes: [
          "title",
          "description",
          "file_name",
          "employee_name",
          "department",
          "extracted_text",
        ],
        filterableAttributes: ["department", "employee_id", "id"],
        sortableAttributes: ["created_at"],
      });

      console.log("✓ MeiliSearch configured");
    } catch (err) {
      console.error("✗ MeiliSearch initialization error:", err.message);
    }
  }

  //  Database Operations
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

  //  MeiliSearch Operations
  async addToMeiliSearch(document, extractedText) {
    try {
      const index = this.meiliClient.index(this.indexName);

      const docData = {
        id: document.id,
        title: document.title || "",
        description: document.description || "",
        file_name: document.file_name || "",
        file_path: document.file_path || "",
        employee_name: document.employee_name || "",
        employee_id: document.employee_id || null,
        department: document.department || "",
        extracted_text: extractedText || "",
        created_at: document.created_at || new Date(),
      };

      await index.addDocuments([docData]);
      console.log(`✓ Document ${document.id} indexed in MeiliSearch`);
      return true;
    } catch (err) {
      console.error("✗ Error adding to MeiliSearch:", err.message);
      return false;
    }
  }

  async deleteFromMeiliSearch(documentId) {
    try {
      const index = this.meiliClient.index(this.indexName);
      await index.deleteDocument(documentId);
      console.log(`✓ Document ${documentId} removed from MeiliSearch`);
      return true;
    } catch (err) {
      console.error("✗ Error deleting from MeiliSearch:", err.message);
      return false;
    }
  }

  async syncAllToMeiliSearch() {
    try {
      const documents = await Document.getAll();
      const index = this.meiliClient.index(this.indexName);

      await index.deleteAllDocuments();

      if (documents.length > 0) {
        const meiliDocs = [];

        for (const doc of documents) {
          let extractedText = "";

          if (doc.file_path && fs.existsSync(doc.file_path)) {
            try {
              extractedText = await Document.extractFile(
                doc.file_path,
                doc.file_name
              );
            } catch (err) {
              console.error(
                `Error extracting text from ${doc.file_name}:`,
                err.message
              );
            }
          }

          meiliDocs.push({
            id: doc.id,
            title: doc.title || "",
            description: doc.description || "",
            file_name: doc.file_name || "",
            file_path: doc.file_path || "",
            employee_name: doc.employee_name || "",
            employee_id: doc.employee_id || null,
            department: doc.department || "",
            extracted_text: extractedText,
            created_at: doc.created_at,
          });
        }

        await index.addDocuments(meiliDocs);
      }

      console.log(`✓ Synced ${documents.length} documents to MeiliSearch`);
      return documents.length;
    } catch (err) {
      console.error("✗ Sync error:", err.message);
      throw err;
    }
  }

  //  Search Operations
  async search(query, options = {}) {
    try {
      const index = this.meiliClient.index(this.indexName);

      const searchOptions = {
        limit: options.limit || 20,
        offset: options.offset || 0,
        filter: options.filter || null,
      };

      const results = await index.search(query, searchOptions);

      return {
        hits: results.hits,
        totalHits: results.estimatedTotalHits,
        query: results.query,
        processingTime: results.processingTimeMs,
      };
    } catch (err) {
      console.error("✗ Search error:", err.message);
      throw err;
    }
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

      // Prepare document for Elasticsearch
      const doc = {
        document_id: documentId,
        embedding: embedding,
        title: documentMetadata.title || "",
        description: documentMetadata.description || "",
        file_name: documentMetadata.file_name || "",
        department: documentMetadata.department || "",
        employee_id: documentMetadata.employee_id || null,
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
