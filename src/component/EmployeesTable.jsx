import { useState, useEffect } from "react";
import "../style.css";

export default function EmployeesTable() {
  // State to hold all employees fetched from API
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch employees from API when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/employees"); // API endpoint
        if (!res.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Show loading state
  if (loading) {
    return <div className="employees-container">Loading employees...</div>;
  }

  // Show error state
  if (error) {
    return <div className="employees-container">Error: {error}</div>;
  }

  // Show message if no employees found
  if (employees.length === 0) {
    return (
      <div className="employees-container">
        <h2>No Employees Found</h2>
        <p>Add employees to see them here.</p>
      </div>
    );
  }

  // Render employees table
  return (
    <div className="employees-container">
      <h2>Employees List</h2>
      <table className="employees-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>National ID</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp, index) => (
            <tr key={emp.id}>
              <td>{index + 1}</td>
              <td>{emp.fullName}</td>
              <td>{emp.nationalId}</td>
              <td>${emp.salary}</td>
              <td className="actions">
                <button className="view-btn">View</button>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
