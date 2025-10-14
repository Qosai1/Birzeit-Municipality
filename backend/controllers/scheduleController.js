import db from "../db/connection.js";

//  Get all interviews
export const getAllInterviews = (req, res) => {
  db.query("SELECT * FROM scheduleinterview", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

//  Get one interview by ID
export const getInterviewById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM scheduleinterview WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0)
        return res.status(404).json({ message: "Interview not found" });
      res.json(result[0]);
    }
  );
};

// Add new interview
export const addInterview = (req, res) => {
  const {
    employeeName,
    email,
    department,
    interviewType,
    interviewMode,
    interviewDate,
    interviewTime,
    interviewer,
    location,
    duration,
    notes,
  } = req.body;

  const sql = `
    INSERT INTO scheduleinterview
    (employeeName, email, department, interviewType, interviewMode, interviewDate, interviewTime, interviewer, location, duration, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    employeeName,
    email,
    department,
    interviewType,
    interviewMode,
    interviewDate,
    interviewTime,
    interviewer,
    location,
    duration,
    notes,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res
      .status(201)
      .json({
        message: "Interview scheduled successfully",
        id: result.insertId,
      });
  });
};

// Update interview
export const updateInterview = (req, res) => {
  const { id } = req.params;
  const {
    employeeName,
    email,
    department,
    interviewType,
    interviewMode,
    interviewDate,
    interviewTime,
    interviewer,
    location,
    duration,
    notes,
  } = req.body;

  const sql = `
    UPDATE scheduleinterview SET
    employeeName=?, email=?, department=?, interviewType=?, interviewMode=?, interviewDate=?, interviewTime=?, interviewer=?, location=?, duration=?, notes=?
    WHERE id=?
  `;
  const values = [
    employeeName,
    email,
    department,
    interviewType,
    interviewMode,
    interviewDate,
    interviewTime,
    interviewer,
    location,
    duration,
    notes,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Interview not found" });
    res.json({ message: "Interview updated successfully" });
  });
};

// Delete interview
export const deleteInterview = (req, res) => {
  const { id } = req.params;
  db.query(
    "DELETE FROM scheduleinterview WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Interview not found" });
      res.json({ message: "Interview deleted successfully" });
    }
  );
};
