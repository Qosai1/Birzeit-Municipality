import React, { useEffect, useState } from "react";

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/documents");
      const data = await response.json();

      const cleanedData = data.filter(
        (doc) =>
          doc.department && doc.department.trim() !== "" && doc.is_deleted === 0
      );

      if (user && user.role === "admin") {
        setDocuments(cleanedData);
        return;
      }

      if (user && user.role === "HR") {
        const filtered = cleanedData.filter((doc) => doc.department === "HR");
        setDocuments(filtered);
        return;
      }

      if (user && user.role === "employee") {
        const filtered = cleanedData.filter(
          (doc) => doc.department === "employee"
        );
        setDocuments(filtered);
        return;
      }

      setDocuments(cleanedData);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const viewFile = (filePath) => {
    window.open(`http://localhost:5000/${filePath}`, "_blank");
  };

  const downloadFile = (filePath) => {
    window.open(`http://localhost:5000/${filePath}`, "_blank");
  };

  const filteredDocuments = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();
    return (
      doc.file_name.toLowerCase().includes(term) ||
      doc.title.toLowerCase().includes(term) ||
      doc.employee_name.toLowerCase().includes(term) ||
      doc.department.toLowerCase().includes(term) ||
      doc.description?.toLowerCase().includes(term)
    );
  });
  const softDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${id}/soft-delete`,
        { method: "PUT" }
      );

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));

        await fetchDocuments();
      }
    } catch (error) {
      console.error("Soft delete error:", error);
    }
  };

  return (
    <div className="documents-container">
      <h2>Uploaded Documents</h2>

      <input
        type="text"
        placeholder="Search documents..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "15px",
          padding: "8px",
          width: "50%",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

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
          {filteredDocuments.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.file_name}</td>
              <td>{doc.title}</td>
              <td>{doc.description}</td>
              <td>{doc.department}</td>
              <td>{doc.employee_name}</td>
              <td>{new Date(doc.uploaded_at).toLocaleString()}</td>

              <td className="action-buttons">
                <button
                  className="view-btn"
                  onClick={() => viewFile(doc.file_path)}
                >
                  Download
                </button>
                <button
                  className="delete-btn-document"
                  onClick={() => softDelete(doc.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredDocuments.length === 0 && <p>No documents found.</p>}
    </div>
  );
}
