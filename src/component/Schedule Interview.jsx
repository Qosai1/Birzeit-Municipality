import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import "../style.css";

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

  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("interviews");
    if (stored) setInterviews(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("interviews", JSON.stringify(interviews));
  }, [interviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

   
    setInterviews([...interviews, formData]);

  
    const templateParams = {
      to_email: formData.email,
      name: formData.employeeName,
      position: formData.department,
      date: formData.interviewDate,
      time: formData.interviewTime,
      location: formData.location,
    };

  
    emailjs
      .send(
        "service_pys19up", // Service ID
        "template_h2dhgcy", // Template ID
        templateParams,
        "Bp5qg8qK9GrKxMucC" // Public Key
      )
      .then(
        (response) => {
          console.log("Email sent successfully!", response.status, response.text);
          alert("Interview scheduled and email sent to the candidate successfully!");
        },
        (error) => {
          console.error("Failed to send email:", error);
          alert("⚠️ Interview saved, but email failed to send.");
        }
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
  };

  const handleDelete = (index) => {
    const updated = interviews.filter((_, i) => i !== index);
    setInterviews(updated);
  };

  return (
    <div className="interview-container">
      <h2 className="page-title"> HR Interview Scheduling System</h2>

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
      </form>

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
            {interviews.map((item, index) => (
              <tr key={index}>
                <td>{item.employeeName}</td>
                <td>{item.email}</td>
                <td>{item.department}</td>
                <td>{item.interviewDate}</td>
                <td>{item.interviewTime}</td>
                <td>{item.interviewMode}</td>
                <td>{item.interviewer}</td>
                <td>{item.location}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
