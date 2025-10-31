import React from "react";
import "../style.css";

export default function EditEmployeeModal({ editForm, onChange, onSave, onCancel }) {
  if (!editForm) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Employee</h3>
        <form onSubmit={onSave} className="edit-form">

          {/* ===== المعلومات الأساسية ===== */}
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

          <label>Department</label>
          <input
            type="text"
            name="department"
            value={editForm.department || ""}
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

          <hr />

          {/* ===== بيانات الحساب ===== */}
          <h4>Account Information</h4>

          <label>Username</label>
          <input
            type="text"
            name="username"
            value={editForm.username || ""}
            onChange={onChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={editForm.password || ""}
            onChange={onChange}
          />

          <label>Role</label>
          <select
            name="role"
            value={editForm.role || "employee"}
            onChange={onChange}
          >
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>

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
