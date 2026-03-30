import elasticClient, {
  testConnection,
  initializeEmbeddingsIndex,
} from "../db/elasticsearch.js";

/**
 * Document model
 * Minimal wrapper around Elasticsearch
 * - No MySQL dependency
 * - Elasticsearch: CRUD on document index (document_embeddings_v2)
 */
class Document {
  constructor() {
    this.elasticIndexName = "document_embeddings_v2";
    this.elasticInitialized = false;
  }

  /**
   * Initialize Elasticsearch for document index
   * @returns {Promise<boolean>}
   */
  async initializeElasticsearch() {
    if (this.elasticInitialized) return true;

    try {
      const connected = await testConnection();
      if (!connected) {
        console.warn(
          "⚠️  Elasticsearch is not available. Semantic search will be disabled.",
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
    return Date.now() + Math.floor(Math.random() * 1_000_000);
  }

  // ========== Elasticsearch Document Queries ==========

  /**
   * Get all non-deleted documents from Elasticsearch
   * @returns {Promise<Array>}
   */
  static async getAll() {
    const documentInstance = new Document();
    const initialized = await documentInstance.initializeElasticsearch();

    if (!initialized) {
      console.warn(
        "⚠️  Elasticsearch not available. Cannot retrieve documents.",
      );
      return [];
    }

    try {
      const response = await elasticClient.search({
        index: documentInstance.elasticIndexName,
        body: {
          query: {
            bool: {
              must_not: [{ term: { deleted: true } }],
            },
          },
          size: 10_000,
        },
      });

      return response.hits.hits.map((hit) => {
        const src = hit._source;
        return {
          id: src.document_id || null,
          title: src.title || "",
          description: src.description || "",
          file_name: src.file_name || "",
          file_path: src.file_path || "",
          employee_name: src.employee_name || "",
          employee_id: src.employee_id || null,
          department: src.department || "",
          created_at: src.created_at || new Date().toISOString(),
          updated_at: src.updated_at || new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error(
        "✗ Error getting all documents from Elasticsearch:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Get single document by ID from Elasticsearch
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async getById(id) {
    const documentInstance = new Document();
    const initialized = await documentInstance.initializeElasticsearch();

    if (!initialized) {
      console.warn(
        `⚠️  Elasticsearch not available. Cannot retrieve document ${id}.`,
      );
      return null;
    }

    try {
      const response = await elasticClient.get({
        index: documentInstance.elasticIndexName,
        id: id.toString(),
      });

      if (!response.found) return null;

      const src = response._source;
      return {
        id: src.document_id || null,
        title: src.title || "",
        description: src.description || "",
        file_name: src.file_name || "",
        file_path: src.file_path || "",
        employee_name: src.employee_name || "",
        employee_id: src.employee_id || null,
        department: src.department || "",
        created_at: src.created_at || new Date().toISOString(),
        updated_at: src.updated_at || new Date().toISOString(),
        extracted_text: src.extracted_text || "",
      };
    } catch (err) {
      if (err.meta?.statusCode === 404) {
        return null;
      }
      console.error(
        "✗ Error getting document from Elasticsearch:",
        err.message,
      );
      return null;
    }
  }

  /**
   * Get all non-deleted documents for a department
   * @param {string} department
   * @returns {Promise<Array>}
   */
  static async getAllByDepartment(department) {
    const documentInstance = new Document();
    const initialized = await documentInstance.initializeElasticsearch();

    if (!initialized) {
      console.warn(
        "⚠️  Elasticsearch not available. Cannot retrieve documents.",
      );
      return [];
    }

    try {
      const response = await elasticClient.search({
        index: documentInstance.elasticIndexName,
        body: {
          query: {
            bool: {
              must: [{ term: { department } }],
              must_not: [{ term: { deleted: true } }],
            },
          },
          size: 10_000,
        },
      });

      return response.hits.hits.map((hit) => {
        const src = hit._source;
        return {
          id: src.document_id || null,
          title: src.title || "",
          description: src.description || "",
          file_name: src.file_name || "",
          file_path: src.file_path || "",
          employee_name: src.employee_name || "",
          employee_id: src.employee_id || null,
          department: src.department || "",
          created_at: src.created_at || new Date().toISOString(),
          updated_at: src.updated_at || new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error(
        "✗ Error getting documents by department from Elasticsearch:",
        err.message,
      );
      throw err;
    }
  }

  // ========== Create & Soft Delete ==========

  /**
   * Generate new document ID (no MySQL validation)
   * Actual document storage happens in Elasticsearch via ElasticsearchService
   * @returns {Promise<number>} generated document ID
   */
  static async create() {
    return Document.generateDocumentId();
  }

  /**
   * Soft delete: mark document as deleted in Elasticsearch
   * @param {number} id
   * @returns {Promise<{success: boolean, affectedRows: number}>}
   */
  static async softDelete(id) {
    const documentInstance = new Document();

    try {
      const response = await elasticClient.update({
        index: documentInstance.elasticIndexName,
        id: id.toString(),
        body: { doc: { deleted: true } },
        retry_on_conflict: 3,
      });

      return {
        affectedRows: response.result === "updated" ? 1 : 0,
        success: response.result === "updated",
      };
    } catch (err) {
      console.error("✗ Error soft deleting document:", err.message);
      return { affectedRows: 0, success: false };
    }
  }
}

export default Document;
