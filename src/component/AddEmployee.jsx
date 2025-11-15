import { useState } from "react";
import Notification from "./Notification";
import "../style.css";

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    birthDate: "",
    phoneNumber: "",
    nationalId: "",
    address: "",
    homePhone: "",
    salary: "",
    startDate: "",
    username: "",
    password: "",
    role: "employee", 
  });

  const [notification, setNotification] = useState({ type: "", message: "" });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 5000);
  };

 const handleChange = (e) => {
  const { name, value } = e.target;


  if (name === "department") {
    let autoRole = "employee";

    if (value === "HR") autoRole = "HR";
    if (value === "Admin") autoRole = "admin";

    setFormData({ ...formData, department: value, role: autoRole });
    return;
  }

  setFormData({ ...formData, [name]: value });
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("success", `Employee ${formData.fullName} added successfully!`);
        setFormData({
          fullName: "",
          email: "",
          department: "",
          birthDate: "",
          phoneNumber: "",
          nationalId: "",
          address: "",
          homePhone: "",
          salary: "",
          startDate: "",
          username: "",
          password: "",
          role: "employee",
        });
      } else {
        showNotification("error", "Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Server error, please try again.");
    }
  };

  return (
    <div className="add-employee-container">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <form className="add-employee-form" onSubmit={handleSubmit}>
        <h2>Add New Employee</h2>

        <label>
          Full Name:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
  Department:
  <select
    name="department"
    value={formData.department}
    onChange={handleChange}
    required
    style={{ padding: "6px", borderRadius: "6px", marginLeft: "10px" }}
  >
    <option value="">Select Department</option>
    <option value="HR">HR</option>
    <option value="Employee">Employee</option>
    <option value="Admin">Admin</option>
  </select>
   </label>


        <label>
          Date of Birth:
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Phone Number:
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          National ID:
          <input
            type="number"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>

        <label>
          Home Phone:
          <input
            type="tel"
            name="homePhone"
            value={formData.homePhone}
            onChange={handleChange}
          />
        </label>

        <label>
          Salary:
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
          />
        </label>

        <label>
          Employment Start Date:
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </label>

        <hr />

        <h3>Account Information</h3>

        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

      

        <button type="submit" className="save-btn">
          Save Employee
        </button>
      </form>
    </div>
  );
}
