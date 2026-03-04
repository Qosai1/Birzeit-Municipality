import "../style.css";
import { useEffect, useState } from "react";

export default function Details() {
  const [employees, setEmployees] = useState([]);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    fetchEmployees();
    fetchDocumentCount(); 
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchDocumentCount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/documents/stats/count");
      const data = await res.json();
      setDocumentCount(data.totalDocuments); 
    } catch (err) {
      console.error("Failed to fetch document count:", err);
    }
  };

  return (
    <div className="details">
      <div className="total-employees">
        <h3>Total Employees</h3>
        <h5>{employees.length}</h5>
      </div>

      <div className="document-archived">
        <h3>Document Archived</h3>
        <h5>{documentCount}</h5>
      </div>
    </div>
  );
}