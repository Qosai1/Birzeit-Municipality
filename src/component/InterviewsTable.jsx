import React, { useEffect, useState } from "react";
import "../style.css";
import Notification from "./Notification";
import InterviewCalendar from "./InterviewCalendar";

export default function InterviewsTable({ refreshTrigger }) {
  const [interviews, setInterviews] = useState([]);
  const [notification, setNotification] = useState({ type: "", message: "" });
const [showConfirm, setShowConfirm] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState(null);
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 3000);
  };

  useEffect(() => {
    fetchInterviews();
  }, [refreshTrigger]); 

  const fetchInterviews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/interviews");
      const data = await res.json();
      setInterviews(data);
    } catch (err) {
      console.error(err);
      showNotification("error", "Failed to load interviews!");
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
      const {id} = selectedEmployee;

    try {
      const res = await fetch(`http://localhost:5000/api/interviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInterviews(interviews.filter((i) => i.id !== id));
        showNotification("success", "Interview deleted successfully!");
      } else {
        showNotification("error", "Failed to delete interview.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Server error while deleting interview.");
    }finally {
    setShowConfirm(false);
    setSelectedEmployee(null);
  }

  };

  return (
    <div className="interview-table-container">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />
      <h3 className="table-title">Scheduled Interviews</h3>
      {interviews.length === 0 ? (
        <p className="no-data">No interviews scheduled yet.</p>
      ) : (
        <table className="interview-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Email</th>
              <th>Department</th>
              <th>Date</th>
              <th>Time</th>
              <th>Mode</th>
              <th>Interviewer</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((item) => (
              <tr key={item.id}>
                <td>{item.employeeName}</td>
                <td>{item.email}</td>
                <td>{item.department}</td>
                <td>{item.interviewDate?.slice(0, 10)}</td>
                <td>{item.interviewTime}</td>
                <td>{item.interviewMode}</td>
                <td>{item.interviewer}</td>
                <td>{item.location}</td>
                <td>
                   <button
                    className="delete-btn"
                    onClick={() => {
                     setSelectedEmployee({ id: item.id, name: item.name });
                        setShowConfirm(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
       {showConfirm && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Disable Employee</h3>
      <p>
        Are you sure you want to disable{" "}
        <strong>{selectedEmployee?.name}</strong>?
      </p>

      <div className="modal-actions">
        <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
          Cancel
        </button>
        <button className="btn-confirm" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
