import { useState } from "react";
import "../style.css";

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthDate: "",
    phoneNumber: "",
    nationalId: "",
    address: "",
    homePhone: "",
    age: "",
    salary: "",
    startDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const updatedEmployees = [...employees, formData];

  localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  alert(`Employee ${formData.fullName} added successfully!`);
  setFormData({
    fullName: "",
    email: "",
    birthDate: "",
    phoneNumber: "",
    nationalId: "",
    address: "",
    homePhone: "",
    age: "",
    salary: "",
    startDate: "",
  });
};


  return (
    <div className="add-employee-container">
      <h2>Add New Employee</h2>

      <form className="add-employee-form" onSubmit={handleSubmit}>
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
            type="text"
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
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
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

        <button type="submit" className="save-btn">
          Save Employee
        </button>
      </form>
    </div>
  );
}
