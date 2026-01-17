import React, { useEffect, useState } from "react";

export default function DocumentsList({ refreshKey }) {
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [elastic, setElastic] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user,refreshKey]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/documents");
      const data = await response.json();

      const cleanedData = (data || []).filter(
        (doc) =>
          doc &&
          doc.department &&
          typeof doc.department === "string" &&
          doc.department.trim() !== ""
      );

      if (user && user.role === "admin") {
        setDocuments(cleanedData);
      } else if (user && user.role) {
        setDocuments(
          cleanedData.filter((doc) => doc && doc.department === user.role)
        );
      } else {
        setDocuments(cleanedData);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const viewFile = (filePath) => {
    window.open(`http://localhost:5000/${filePath}`, "_blank");
  };

  /* ===========================
     ELASTIC SEARCH (FIXED)
     =========================== */
  const elasticSearch = async () => {
  if (!elastic.trim()) return;

  try {
    setLoading(true);

    const response = await fetch(
      `http://localhost:5000/api/documents/search/semantic?query=${encodeURIComponent(elastic)}`,
      { method: "GET" }
    );

    const data = await response.json();

    let results = data.results || [];


    if (user && user.role && user.role !== "admin") {
      results = (results || []).filter(doc => doc && doc.department === user.role);
    }
    results.sort((a, b) => b.semanticScore - a.semanticScore);
    setDocuments(results);

  } catch (error) {
    console.error("ELASTIC SEARCH ERROR:", error);
  } finally {
    setLoading(false);
  }
};


  const softDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${id}/soft-delete`,
        { method: "PUT" }
      );

      if (response.ok) fetchDocuments();
    } catch (error) {
      console.error("Soft delete error:", error);
    }
  };

  /* ===========================
     NORMAL SEARCH (FRONTEND)
     =========================== */
  const filteredDocuments = documents.filter((doc) => {
    if (!searchTerm) return true; // Show all if no search term

    const term = searchTerm.toLowerCase();
    return (
      (doc.file_name || "").toLowerCase().includes(term) ||
      (doc.title || "").toLowerCase().includes(term) ||
      (doc.employee_name || "").toLowerCase().includes(term) ||
      (doc.department || "").toLowerCase().includes(term) ||
      (doc.description || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="documents-container">
      <h2>Uploaded Documents</h2>

      {/* Frontend search */}
      <input
        type="text"
        placeholder="Quick search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "50%", marginBottom: "10px" }}
      />

      <br />

      {/* Elastic search */}
      <input
        type="text"
        placeholder="Semantic search (Elastic)..."
        value={elastic}
        onChange={(e) => setElastic(e.target.value)}
        style={{ width: "50%",  marginBottom: "10px"}}
      />

      <button onClick={elasticSearch} style={{ marginLeft: "10px" , borderRadius:"8px", padding:"8px 12px", backgroundColor:"#4CAF50", color:"white", border:"none", cursor:"pointer" }}>
        Search
      </button>

      {loading && <p>Searching...</p>}

      <table className="documents-table">
        <thead>
           <tr>
             <th>File Name</th>
             <th>Title</th>
              <th>Description</th>
               <th>Department</th>
               <th>Uploaded By</th>
                <th>Uploaded At</th>
                 <th>Action</th>
                  </tr>
                   </thead>
                   <tbody>
                    {filteredDocuments.map((doc) =>
                     ( <tr key={doc.id}>
                       <td>{doc.file_name || "N/A"}</td>
                       <td>{doc.title || "N/A"}</td>
                     <td>{doc.description || "N/A"}</td>
                     <td>{doc.department || "N/A"}</td>
                     <td>{doc.employee_name || "N/A"}</td>
                      <td>{doc.created_at ? new Date(doc.created_at).toLocaleString() : "N/A"}</td>
                      <td className="action-buttons">
                         <button className="view-btn" onClick={() => doc.file_path && viewFile(doc.file_path)} disabled={!doc.file_path}>
                           Download </button>
                           <button className="delete-btn-document" onClick={() => softDelete(doc.id)} >
                            Delete </button>
                             </td>
                            </tr>
                           ))}
                            </tbody>
                            </table>
                            {filteredDocuments.length === 0 && <p>No documents found.</p>}
                            </div>
                             );
                             }