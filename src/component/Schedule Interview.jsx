import React, { useState } from "react";
import emailjs from "emailjs-com";
import Notification from "./Notification";
import InterviewsTable from "./InterviewsTable";
import "../style.css";
import { Link } from "react-router-dom";


export default function ScheduleInterview() {
  const [formData, setFormData] = useState({
    employeeName: "",
    email: "",
    department: "",
    interviewType: "",
    interviewMode: "",
    interviewDate: "",
    interviewTime: "",
    interviewer: "",
    location: "",
    duration: "",
    notes: "",
  });

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        await emailjs.send(
          "service_pys19up",
          "template_h2dhgcy",
          {
            to_email: formData.email,
            name: formData.employeeName,
            position: formData.department,
            date: formData.interviewDate,
            time: formData.interviewTime,
            location: formData.location,
          },
          "Bp5qg8qK9GrKxMucC"
        );

        showNotification(
          "success",
          `Interview scheduled for ${formData.employeeName}! Email sent successfully.`
        );

        setFormData({
          employeeName: "",
          email: "",
          department: "",
          interviewType: "",
          interviewMode: "",
          interviewDate: "",
          interviewTime: "",
          interviewer: "",
          location: "",
          duration: "",
          notes: "",
        });

        setRefreshTrigger((prev) => prev + 1); 
      } else {
        showNotification("error", data.error || "Failed to schedule interview.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Server error, please try again.");
    }
  };

  return (
    <div className="interview-container">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      <h2 className="page-title">HR Interview Scheduling System</h2>

      <form className="interview-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Candidate Full Name</label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="candidate@gmail.com"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Position / Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Interview Type</label>
            <select
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              required
            >
              <option value="">Select type</option>
              <option value="Technical">Technical</option>
              <option value="Administrative">Administrative</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Interview Mode</label>
            <select
              name="interviewMode"
              value={formData.interviewMode}
              onChange={handleChange}
              required
            >
              <option value="">Select mode</option>
              <option value="In-person">In-person</option>
              <option value="Online">Online</option>
              <option value="Phone Call">Phone Call</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 45"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Interview Date</label>
            <input
              type="date"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Interview Time</label>
            <input
              type="time"
              name="interviewTime"
              value={formData.interviewTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Interviewer Name</label>
            <input
              type="text"
              name="interviewer"
              value={formData.interviewer}
              onChange={handleChange}
              placeholder="HR Officer / Engineer Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Location / Meeting Link</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Meeting room or video link"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Interview Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes or instructions..."
          />
        </div>

        <button type="submit" className="schedule-btn">
          Schedule Interview & Send Email
        </button>
        <Link to="/interviews" className="view-table-link">
              View Scheduled Interviews</Link>
      </form>

  
      
    </div>
  );
}
