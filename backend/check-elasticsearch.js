// Script to check Elasticsearch connection
import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

const esUrl = process.env.ELASTICSEARCH_URL || "http://localhost:9200";

console.log(" Checking Elasticsearch connection...");
console.log(` URL: ${esUrl}\n`);

const client = new Client({
  node: esUrl,
  auth:
    process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD
      ? {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        }
      : undefined,
  ssl:
    process.env.ELASTICSEARCH_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

async function checkConnection() {
  try {
    // Test 1: Ping
    console.log(" Testing ping...");
    const ping = await client.ping();
    if (ping) {
      console.log("    Ping successful\n");
    } else {
      throw new Error("Ping failed");
    }

    // Test 2: Cluster health
    console.log(" Getting cluster health...");
    const health = await client.cluster.health();
    console.log("    Cluster health retrieved");
    console.log(`   → Cluster name: ${health.cluster_name}`);
    console.log(`   → Status: ${health.status}`);
    console.log(`   → Number of nodes: ${health.number_of_nodes}\n`);

    // Test 3: Check indices
    console.log(" Checking indices...");
    const indices = await client.cat.indices({ format: "json" });
    console.log(`    Found ${indices.length} indices`);
    if (indices.length > 0) {
      console.log("   → Indices:");
      indices.forEach((idx) => {
        console.log(`      - ${idx.index} (${idx["docs.count"]} documents)`);
      });
    }
    console.log("");

    // Test 4: Check document_embeddings index
    console.log(" Checking document_embeddings index...");
    const indexExists = await client.indices.exists({
      index: "document_embeddings",
    });
    if (indexExists) {
      const count = await client.count({ index: "document_embeddings" });
      console.log(`    Index exists with ${count.count} documents\n`);
    } else {
      console.log(
        "     Index does not exist (will be created on first use)\n"
      );
    }

    console.log(" All checks passed! Elasticsearch is ready to use.");
    return true;
  } catch (err) {
    console.error("\n Connection failed!");
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code || "N/A"}\n`);

    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("other side closed")
    ) {
      console.error(" Elasticsearch is not running or not accessible.");
      console.error("   → Make sure Elasticsearch is started");
      console.error("   → Check if it's running on the correct port");
      console.error("   → Try: curl http://localhost:9200\n");
    } else if (
      err.message.includes("authentication") ||
      err.message.includes("401")
    ) {
      console.error(" Authentication failed.");
      console.error(
        "   → Check ELASTICSEARCH_USERNAME and ELASTICSEARCH_PASSWORD in .env"
      );
      console.error("   → Or disable security: xpack.security.enabled=false\n");
    }

    return false;
  }
}

checkConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
