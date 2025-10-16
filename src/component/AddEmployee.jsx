import { useState } from "react";
import "../style.css";

export default function AddEmployee() {
  // State to hold the form data
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

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Employee ${formData.fullName} added successfully!`);

        // Reset form after submission
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

      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Server error, check console.");
    }
  };

  return (
    <div className="add-employee-container">
      <h2>Add New Employee</h2>

      {/* Employee form */}
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
