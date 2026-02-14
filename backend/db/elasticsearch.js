import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

// =====================
// Configuration
// =====================
const esUrl = process.env.ELASTICSEARCH_URL || "http://localhost:9200";

const hasAuth =
  process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD;

const useSSL =
  process.env.ELASTICSEARCH_SSL === "true" || esUrl.startsWith("https://");

// =====================
// Elasticsearch Client
// =====================
const elasticClient = new Client({
  node: esUrl,

  auth: hasAuth
    ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
      }
    : undefined,

  // ✅ IMPORTANT: use `tls` (NOT ssl) for Elasticsearch v8+
  tls: useSSL
    ? {
        rejectUnauthorized:
          process.env.ELASTICSEARCH_SSL_REJECT_UNAUTHORIZED === "false"
            ? false
            : true,
      }
    : undefined,

  requestTimeout: 30000,
  pingTimeout: 3000,
  maxRetries: 3,
  maxSockets: 10,
  log: process.env.NODE_ENV === "development" ? "error" : undefined,
});

// =====================
// Test Connection
// =====================
async function testConnection() {
  console.log(`Connecting to Elasticsearch at: ${esUrl}`);
  if (useSSL) console.log("  → Using SSL/TLS");

  try {
    // Ping with timeout
    await Promise.race([
      elasticClient.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 5000),
      ),
    ]);

    const health = await elasticClient.cluster.health({
      timeout: "5s",
    });

    console.log("✓ Elasticsearch connected");
    console.log(`  → Cluster: ${health.cluster_name}`);
    console.log(`  → Status: ${health.status}`);

    return true;
  } catch (err) {
    console.error("✗ Elasticsearch connection error");
    console.error(`  → URL: ${esUrl}`);
    console.error(`  → Message: ${err.message}`);
    console.error(`  → Code: ${err.code || "N/A"}`);

    console.error(
      "\n⚠️ Application will continue but Elasticsearch will not work\n",
    );
    return false;
  }
}

// =====================
// Initialize Index
// =====================
async function initializeEmbeddingsIndex() {
  const indexName = "document_embeddings";

  try {
    const exists = await elasticClient.indices.exists({
      index: indexName,
    });

    // ✅ v8 returns exists.body
    if (!exists.body) {
      await elasticClient.indices.create({
        index: indexName,
        mappings: {
          properties: {
            document_id: { type: "long" },

            embedding: {
              type: "dense_vector",
              dims: 384,
              index: true,
              similarity: "cosine",
            },

            title: { type: "text" },
            description: { type: "text" },
            file_name: { type: "keyword" },
            file_path: { type: "keyword" },
            employee_name: { type: "text" },
            department: { type: "keyword" },
            employee_id: { type: "integer" },
            extracted_text: { type: "text" },
            created_at: { type: "date" },
            updated_at: { type: "date" },
          },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
      });

      console.log(`✓ Index "${indexName}" created`);
    } else {
      console.log(`✓ Index "${indexName}" already exists`);
    }

    return true;
  } catch (err) {
    console.error("✗ Error creating index:", err.message);
    return false;
  }
}

export default elasticClient;
export { testConnection, initializeEmbeddingsIndex };
