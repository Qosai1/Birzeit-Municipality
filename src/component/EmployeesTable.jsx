import { useState, useEffect } from "react";
import "../style.css";

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);

  
  useEffect(() => {
    const savedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
    setEmployees(savedEmployees);
  }, []);

 


  if (employees.length === 0) {
    return (
      <div className="employees-container">
        <h2>No Employees Found</h2>
        <p>Add employees to see them here.</p>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <h2>Employees List</h2>
      <table className="employees-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>nationalId</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{emp.fullName}</td>
              <td>{emp.nationalId}</td>
              <td>{emp.salary}$</td>
              <td className="actions">
                <button className="view-btn" >
                  View
                </button>
                <button className="edit-btn">
                  Edit
                </button>
                <button className="delete-btn" >
                  Delete
                </button>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
