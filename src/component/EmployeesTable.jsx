import { useEffect, useState } from "react";
import "../style.css";
import Notification from "./Notification";
import EditEmployeeModal from "./EditEmployeeModal"; 

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({});

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 3000);
  };

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
      console.error(err);
      showNotification("error", "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = employees.filter(
      (emp) =>
        emp.fullName?.toLowerCase().includes(value) ||
        emp.nationalId?.toString().includes(value)
    );
    setFilteredEmployees(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("success", `Employee "${name}" deleted successfully!`);
        setEmployees(employees.filter((emp) => emp.id !== id));
        setFilteredEmployees(filteredEmployees.filter((emp) => emp.id !== id));
      } else {
        showNotification("error", data.message || "Failed to delete employee.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Server error while deleting employee.");
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditForm({ ...employee });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:5000/api/employees/${editingEmployee.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      const data = await res.json();

      if (res.ok) {
        showNotification("success", "Employee updated successfully!");
        const updatedList = employees.map((emp) =>
          emp.id === editingEmployee.id ? { ...editForm } : emp
        );
        setEmployees(updatedList);
        setFilteredEmployees(updatedList);
        setEditingEmployee(null);
      } else {
        showNotification("error", data.message || "Failed to update employee.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Server error during update.");
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="scrollable-table">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <div className="search-container">
        <input
          type="text"
          placeholder=" Search by name, or national ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
       
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : filteredEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="employees-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Department </th>
              <th>Birth Date</th>
              <th>Phone</th>
              <th>Home Phone</th>
              <th>National ID</th>
              <th>Address</th>
              <th>Salary</th>
              <th>Start Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.birthDate?.slice(0, 10)}</td>
                <td>{emp.phoneNumber}</td>
                <td>{emp.homePhone}</td>
                <td>{emp.nationalId}</td>
                <td>{emp.address}</td>
                <td>{emp.salary}</td>
                <td>{emp.startDate?.slice(0, 10)}</td>
                <td className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(emp)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(emp.id, emp.fullName)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingEmployee && (
        <EditEmployeeModal
          editForm={editForm}
          onChange={handleChange}
          onSave={handleUpdate}
          onCancel={() => setEditingEmployee(null)}
        />
      )}
    </div>
  );
}
