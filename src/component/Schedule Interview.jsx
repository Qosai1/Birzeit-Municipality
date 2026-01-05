import React, { useState } from "react";
import axios from "axios";
import emailjs from "emailjs-com";
import Notification from "./Notification";
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
    interviewers: [], 
    location: "",
    duration: "",
    notes: "",
  });

  const [interviewerInput, setInterviewerInput] = useState(""); 
  const [suggestions, setSuggestions] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "interviewer") {
      setInterviewerInput(value); // تحديث input البحث
      if (value) {
        fetch(`http://localhost:5000/api/employees?search=${value}`)
          .then((res) => res.json())
          .then((data) => {
            const filtered = data.filter(
              (emp) =>
                emp.fullName &&
                emp.fullName.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
          })
          .catch((err) => console.error(err));
      } else {
        setSuggestions([]);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelect = (emp) => {
    if (!formData.interviewers.some((e) => e.id === emp.id)) {
      setFormData({
        ...formData,
        interviewers: [...formData.interviewers, emp],
      });
    }
    setInterviewerInput(""); 
    setSuggestions([]);
  };

  const handleRemoveInterviewer = (id) => {
    setFormData({
      ...formData,
      interviewers: formData.interviewers.filter((e) => e.id !== id),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    
     const payload = {
  ...formData,
  interviewer: formData.interviewers.map(emp => emp.fullName).join(", "),
};


      await axios.post("http://localhost:5000/api/interviews", payload);

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
        interviewers: [],
        location: "",
        duration: "",
        notes: "",
      });
      setInterviewerInput("");
    } catch (err) {
      console.error(err);
      showNotification("error", "Failed to schedule interview.");
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
            placeholder="Full Name"
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

        {/* Department & Interview Type */}
        <div className="form-row">
          <div className="form-group">
            <label>Position / Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="e.g. Software Engineer / HR"
            />
          </div>
          <div className="form-group">
            <label>Interview Type</label>
            <input
              type="text"
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              placeholder="e.g. Technical / HR"
              required
            />
          </div>
        </div>

        {/* Interview Mode & Duration */}
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

        {/* Date & Time */}
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

        {/* Interviewers */}
        <div className="form-group" style={{ position: "relative" }}>
          <label>Interviewers</label>
          <div className="interviewer-input-container">
            {formData.interviewers.map((emp) => (
              <span key={emp.id} className="interviewer-chip">
                {emp.fullName}
                <button
                  type="button"
                  onClick={() => handleRemoveInterviewer(emp.id)}
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              name="interviewer"
              value={interviewerInput}
              onChange={handleChange}
              placeholder="Start typing to select..."
              autoComplete="off"
              className="interviewer-input"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="autocomplete-suggestions">
              {suggestions.map((emp) => (
                <li key={emp.id} onClick={() => handleSelect(emp)}>
                  {emp.fullName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location & Notes */}
        <div className="form-row">
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
          View Scheduled Interviews
        </Link>
      </form>
    </div>
  );
}
