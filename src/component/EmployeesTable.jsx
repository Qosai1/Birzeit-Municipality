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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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
    if (!window.confirm(`Are you sure you want to disable ${name}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification("success", `Employee "${name}" disabled successfully!`);
        setEmployees(employees.filter((emp) => emp.id !== id));
        setFilteredEmployees(filteredEmployees.filter((emp) => emp.id !== id));
      } else {
        showNotification("error", "Failed to disable employee.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Server error while disabling employee.");
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredEmployees].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (a[key] === b[key]) return 0;
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      } else {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });
    setFilteredEmployees(sorted);
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
          placeholder=" Search by name or national ID..."
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
              {[
                "fullName",
                "email",
                "department",
                "birthDate",
                "phoneNumber",
                "homePhone",
                "nationalId",
                "address",
                "salary",
                "startDate",
              ].map((key) => (
                <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  {sortConfig.key === key &&
                    (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
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
