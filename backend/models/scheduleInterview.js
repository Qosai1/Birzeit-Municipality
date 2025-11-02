import db from "../db/connection.js";

class ScheduleInterview {
  static async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM scheduleinterview ORDER BY interviewDate DESC"
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(
      "SELECT * FROM scheduleinterview WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async create(interviewData) {
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
    } = interviewData;

    const [result] = await db.query(
      `INSERT INTO scheduleinterview
      (employeeName, email, department, interviewType, interviewMode,
       interviewDate, interviewTime, interviewer, location, duration, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    return result.insertId;
  }

  static async update(id, interviewData) {
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
    } = interviewData;

    const [result] = await db.query(
      `UPDATE scheduleinterview
      SET employeeName = ?, email = ?, department = ?,
          interviewType = ?, interviewMode = ?, interviewDate = ?,
          interviewTime = ?, interviewer = ?, location = ?,
          duration = ?, notes = ?
      WHERE id = ?`,
      [
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
      ]
    );

    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query(
      "DELETE FROM scheduleinterview WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  // Custom query: Get upcoming interviews
  static async getUpcoming() {
    const [rows] = await db.query(
      `SELECT * FROM scheduleinterview
       WHERE interviewDate >= CURDATE()
       ORDER BY interviewDate, interviewTime`
    );
    return rows;
  }

  // Custom query: Get interviews by department
  static async getByDepartment(department) {
    const [rows] = await db.query(
      "SELECT * FROM scheduleinterview WHERE department = ?",
      [department]
    );
    return rows;
  }
}

export default ScheduleInterview;
