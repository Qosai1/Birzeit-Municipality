import React from "react";
import "../style.css";

export default function EditEmployeeModal({ editForm, onChange, onSave, onCancel }) {
  if (!editForm) return null; 

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Employee</h3>
        <form onSubmit={onSave} className="edit-form">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={editForm.fullName || ""}
            onChange={onChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={editForm.email || ""}
            onChange={onChange}
          />

          <label>Birth Date</label>
          <input
            type="date"
            name="birthDate"
            value={editForm.birthDate?.slice(0, 10) || ""}
            onChange={onChange}
          />

          <label>Phone</label>
          <input
            type="text"
            name="phoneNumber"
            value={editForm.phoneNumber || ""}
            onChange={onChange}
          />

          <label>Home Phone</label>
          <input
            type="text"
            name="homePhone"
            value={editForm.homePhone || ""}
            onChange={onChange}
          />

          <label>National ID</label>
          <input
            type="text"
            name="nationalId"
            value={editForm.nationalId || ""}
            onChange={onChange}
          />

          <label>Address</label>
          <input
            type="text"
            name="address"
            value={editForm.address || ""}
            onChange={onChange}
          />

          <label>Age</label>
          <input
            type="number"
            name="age"
            value={editForm.age || ""}
            onChange={onChange}
          />

          <label>Salary</label>
          <input
            type="number"
            name="salary"
            value={editForm.salary || ""}
            onChange={onChange}
          />

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={editForm.startDate?.slice(0, 10) || ""}
            onChange={onChange}
          />

          <div className="modal-buttons">
            <button type="submit" className="save-btn">
              Save Changes
            </button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
