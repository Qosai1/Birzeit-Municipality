import { pipeline } from "@xenova/transformers";
import Document from "../models/document.js";
import FileExtractorService from "./FileExtractorService.js";
import { elasticsearchService } from "./ElasticsearchService.js";
import fs from "fs";

/**
 * EmbeddingService
 * Handles AI model initialization and embedding generation
 */
class EmbeddingService {
  constructor() {
    this.embedder = null;
  }

  /**
   * Initialize the embedding model
   */
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

  /**
   * Generate embedding vector from text
   * @param {string} text - Text to generate embedding for
   * @returns {Promise<Array<number>>} Embedding vector
   */
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

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} vec1 - First vector
   * @param {Array<number>} vec2 - Second vector
   * @returns {number} Cosine similarity score
   */
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

  /**
   * Generate and save embedding for a document
   * @param {number} documentId - Document ID
   * @param {string} text - Text content to embed
   * @param {Object} documentMetadata - Document metadata
   * @returns {Promise<boolean>}
   */
  async generateAndSaveEmbedding(documentId, text, documentMetadata = {}) {
    try {
      const embedding = await this.generateEmbedding(text);
      return await elasticsearchService.saveEmbedding(
        documentId,
        embedding,
        documentMetadata
      );
    } catch (err) {
      console.error(
        `✗ Error generating/saving embedding for document ${documentId}:`,
        err.message
      );
      return false;
    }
  }

  /**
   * Generate embeddings for all documents that don't have one
   * @returns {Promise<number>} Number of documents processed
   */
  async generateAllEmbeddings() {
    try {
      console.log("⏳ Generating embeddings for all documents...");

      const documents = await Document.getAll();
      let processed = 0;

      for (const doc of documents) {
        const existingEmbedding = await elasticsearchService.getEmbedding(
          doc.id
        );
        if (existingEmbedding) {
          console.log(`⏭️  Document ${doc.id} already has embedding`);
          continue;
        }

        let extractedText = "";
        if (doc.file_path && fs.existsSync(doc.file_path)) {
          try {
            extractedText = await FileExtractorService.extractFile(
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

        await this.generateAndSaveEmbedding(doc.id, fullText, {
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
}

// Export singleton instance
const embeddingService = new EmbeddingService();

export default EmbeddingService;
export { embeddingService };

