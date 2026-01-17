import elasticClient, {
  testConnection,
  initializeEmbeddingsIndex,
} from "../db/elasticsearch.js";

/**
 * ElasticsearchService
 * Handles all Elasticsearch operations for embeddings storage and semantic search
 */
class ElasticsearchService {
  constructor() {
    this.elasticIndexName = "document_embeddings";
    this.initialized = false;
  }

  /**
   * Initialize Elasticsearch connection and index
   * @returns {Promise<boolean>}
   */
  async initialize() {
    if (this.initialized) return true;

    try {
      const connected = await testConnection();
      if (!connected) {
        console.warn(
          "⚠️  Elasticsearch is not available. Semantic search will be disabled."
        );
        return false;
      }

      await initializeEmbeddingsIndex();
      this.initialized = true;
      console.log("✓ Elasticsearch initialized for embeddings");
      return true;
    } catch (err) {
      console.warn("⚠️  Elasticsearch initialization error:", err.message);
      console.warn("   Semantic search will be disabled.");
      return false;
    }
  }

  /**
   * Save embedding to Elasticsearch
   * @param {number} documentId - Document ID
   * @param {Array<number>} embedding - Embedding vector
   * @param {Object} documentMetadata - Document metadata
   * @returns {Promise<boolean>}
   */
  async saveEmbedding(documentId, embedding, documentMetadata = {}) {
    try {
      // Ensure Elasticsearch is initialized
      const initialized = await this.initialize();
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

  /**
   * Get embedding from Elasticsearch
   * @param {number} documentId - Document ID
   * @returns {Promise<Array<number>|null>}
   */
  async getEmbedding(documentId) {
    try {
      // Ensure Elasticsearch is initialized
      const initialized = await this.initialize();
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

  /**
   * Perform semantic search using vector similarity
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {Object} options - Search options (limit, filter)
   * @returns {Promise<Object>} Search results
   */
  async semanticSearch(queryEmbedding, options = {}) {
    try {
      // Ensure Elasticsearch is initialized
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error(
          "Elasticsearch is not available. Please start Elasticsearch to use semantic search."
        );
      }

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
        searchType: "semantic",
      };
    } catch (err) {
      console.error("✗ Semantic search error:", err.message);
      throw err;
    }
  }
}

// Export singleton instance
const elasticsearchService = new ElasticsearchService();

export default ElasticsearchService;
export { elasticsearchService };

