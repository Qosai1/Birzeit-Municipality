import React, { useState, useEffect } from "react";
import "../style.css";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Statuses");
  const [date, setDate] = useState("");
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    const response = await fetch(
      `http://localhost:5000/api/search?searchTerm=${searchTerm}&department=${department}&status=${status}&date=${date}`
    );
    const data = await response.json();
    setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, department, status, date]);

  return (
    <div className="container">
      <div className="header">
        <h2>Welcome back, dept_head</h2>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search documents by title, content, or document ID..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filters">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>All Departments</option>
            <option>Finance</option>
            <option>HR</option>
            <option>Public Works</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Draft</option>
            <option>Sent</option>
            <option>Archived</option>
          </select>
          <input
            type="date"
            className="date-picker"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="search-btn" onClick={fetchDocuments}>
            Search
          </button>
        </div>
      </div>

      <div className="search-results">
        {documents.length === 0 ? (
          <>
            <div className="document-card">
              <h3>Sample Document 1</h3>
              <div className="meta-info">
                <span className="department">Finance</span>
                <span className="date">2024-01-15</span>
                <span className="status draft">Draft</span>
              </div>
              <p>This is an example description for Document 1.</p>
              <button className="view-btn">View Document</button>
            </div>
            <div className="document-card">
              <h3>Sample Document 2</h3>
              <div className="meta-info">
                <span className="department">HR</span>
                <span className="date">2023-12-20</span>
                <span className="status sent">Sent</span>
              </div>
              <p>This is an example description for Document 2.</p>
              <button className="view-btn">View Document</button>
            </div>
          </>
        ) : (
          documents.map((doc, index) => (
            <div className="document-card" key={index}>
              <h3>{doc.title}</h3>
              <div className="meta-info">
                <span className="department">{doc.department}</span>
                <span className="date">{doc.uploaded_at}</span>
                <span className={`status ${doc.status.toLowerCase()}`}>
                  {doc.status}
                </span>
              </div>
              <p>{doc.description}</p>
              <button className="view-btn">View Document</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
