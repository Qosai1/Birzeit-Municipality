import axios from "axios";

const BASE_URL = "http://localhost:5000/api/documents";

async function runTests() {
  console.log(" Starting Search Tests...\n");

  // Test 1: Text Search
  console.log(" Testing Text Search...");
  try {
    const textResponse = await axios.get(`${BASE_URL}/search/text`, {
      params: { query: "employee", limit: 5 },
    });
    console.log(" Text Search:", textResponse.data.total_hits, "results");
    if (textResponse.data.results && textResponse.data.results.length > 0) {
      console.log(
        "   First result:",
        textResponse.data.results[0]?.title || "No title"
      );
    } else {
      console.log("   No results found");
    }
  } catch (error) {
    console.error(
      " Text Search failed:",
      error.response?.data?.message || error.message
    );
  }

  // Test 2: Semantic Search
  console.log("\n Testing Semantic Search...");
  try {
    const semanticResponse = await axios.get(`${BASE_URL}/search/semantic`, {
      params: { query: "employee contract", limit: 5 },
    });
    console.log(
      " Semantic Search:",
      semanticResponse.data.total_hits,
      "results"
    );
    if (
      semanticResponse.data.results &&
      semanticResponse.data.results.length > 0
    ) {
      console.log("   Top result:", semanticResponse.data.results[0].title);
      console.log(
        "   Similarity score:",
        semanticResponse.data.results[0].semanticScore?.toFixed(3)
      );
    } else {
      console.log("   No results found");
    }
  } catch (error) {
    console.error(
      " Semantic Search failed:",
      error.response?.data?.message || error.message
    );
  }

  // Test 3: Filtered Semantic Search
  console.log("\n Testing Filtered Semantic Search...");
  try {
    const filteredResponse = await axios.get(`${BASE_URL}/search/semantic`, {
      params: {
        query: "employee",
        limit: 5,
        filter: JSON.stringify({ department: "HR" }),
      },
    });
    console.log(
      " Filtered Search:",
      filteredResponse.data.total_hits,
      "results"
    );
    if (
      filteredResponse.data.results &&
      filteredResponse.data.results.length > 0
    ) {
      console.log(
        "   Results filtered by department:",
        filteredResponse.data.results[0].department
      );
    }
  } catch (error) {
    console.error(
      " Filtered Search failed:",
      error.response?.data?.message || error.message
    );
  }

  // Test 4: Empty Query (Error Handling)
  console.log("\n Testing Error Handling (Empty Query)...");
  try {
    await axios.get(`${BASE_URL}/search/semantic`, {
      params: { query: "" },
    });
    console.log("  Should have returned an error");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(" Correctly returned 400 error for empty query");
    } else {
      console.error(" Unexpected error:", error.message);
    }
  }

  console.log("\n Tests completed!");
}

// Run tests
runTests().catch(console.error);
