import { useEffect, useState } from "react";


import "../style.css";

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      const data = await res.json();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  
  const performSearch = () => {
    const value = searchTerm.toLowerCase().trim();
    if (value === "") {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter((emp) =>
      emp.fullName?.toLowerCase().includes(value)||
    emp.nationalId?.toLowerCase().includes(value)
    );

    setFilteredEmployees(filtered);
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

 
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredEmployees(employees);
    }
  };

  return (
    <div className="employees-table-container">
      <h2>Employees List</h2>

      {/*  Search bar */}
      <div className="search-container">
        
        <input
          type="text"
          placeholder= "Search by  name and national ID..."
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          className="search-input"
        />
        <button className="search-btn" onClick={performSearch}>
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : filteredEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="scrollable-table">
          <table className="employees-table">
            <thead>
              <tr>
                
                <th>Full Name</th>
                <th>Email</th>
                <th>Birth Date</th>
                <th>Phone</th>
                <th>National ID</th>
                <th>Address</th>
                <th>Age</th>
                <th>Salary</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, i) => (
                <tr key={emp._id}>
                
                  <td>{emp.fullName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.birthDate?.slice(0, 10)}</td>
                  <td>{emp.phoneNumber}</td>
                  <td>{emp.nationalId}</td>
                  <td>{emp.address}</td>
                  <td>{emp.age}</td>
                  <td>{emp.salary}</td>
                  <td>{emp.startDate?.slice(0, 10)}</td>
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
      )}
    </div>
  );
}
