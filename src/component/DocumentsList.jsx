import React, { useEffect, useState } from "react";

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);


useEffect(() => {
  if (user) {
    fetchDocuments();
  }
}, [user]);

  
const fetchDocuments = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/documents");
    const data = await response.json();

    const cleanedData = data.filter(
      (doc) => doc.department && doc.department.trim() !== ""
    );

    if (user && user.role === "HR") {
      const filtered = cleanedData.filter(
        (doc) => doc.department === "HR"
      );
      setDocuments(filtered);
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

  const downloadFile = (filePath) => {
    window.open(`http://localhost:5000/${filePath}`, "_blank");
  };

  return (
    <div className="documents-container">
      <h2>Uploaded Documents</h2>

      <table className="documents-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Title</th>
            <th>Department</th>
            <th>Uploaded By</th>
            <th>Uploaded At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
  {documents
    .filter(doc => doc.department && doc.department.trim() !== "") 
    .map((doc) => (
      <tr key={doc.id}>
        <td>{doc.file_name}</td>
        <td>{doc.title}</td>
        <td>{doc.department}</td>
        <td>{doc.employee_name}</td>
        <td>{doc.uploaded_at}</td>

        <td className="action-buttons">
          <button
            className="view-btn"
            onClick={() => viewFile(doc.file_path)}
          >
            View
          </button>
          <button
            className="download-btn"
            onClick={() => downloadFile(doc.file_path)}
          >
            Download
          </button>
        </td>
      </tr>
    ))}
</tbody>

      </table>

      {documents.length === 0 && <p>No documents uploaded yet.</p>}
    </div>
  );
}
