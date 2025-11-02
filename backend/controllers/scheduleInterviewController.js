import ScheduleInterview from "../models/scheduleInterview.js";

export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await ScheduleInterview.getAll();

    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interviews",
      error: error.message,
    });
  }
};

// ============================================
// GET INTERVIEW BY ID
// ============================================
export const getInterviewById = async (req, res) => {
  try {
    const interview = await ScheduleInterview.getById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interview",
      error: error.message,
    });
  }
};

// ============================================
// CREATE NEW INTERVIEW
// ============================================
export const createInterview = async (req, res) => {
  try {
    // Validate required fields
    const { employeeName, email, interviewDate } = req.body;

    if (!employeeName || !email || !interviewDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields: employeeName, email, interviewDate",
      });
    }

    const interviewId = await ScheduleInterview.create(req.body);

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: { id: interviewId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error scheduling interview",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE INTERVIEW
// ============================================
export const updateInterview = async (req, res) => {
  try {
    const affectedRows = await ScheduleInterview.update(
      req.params.id,
      req.body
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating interview",
      error: error.message,
    });
  }
};

// ============================================
// DELETE INTERVIEW
// ============================================
export const deleteInterview = async (req, res) => {
  try {
    const affectedRows = await ScheduleInterview.delete(req.params.id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting interview",
      error: error.message,
    });
  }
};

// ============================================
// GET INTERVIEWS BY DATE RANGE
// ============================================
export const getInterviewsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate query parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required as query parameters",
      });
    }

    const interviews = await ScheduleInterview.getByDateRange(
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interviews",
      error: error.message,
    });
  }
};

// ============================================
// GET INTERVIEWS BY DEPARTMENT
// ============================================
export const getInterviewsByDepartment = async (req, res) => {
  try {
    const interviews = await ScheduleInterview.getByDepartment(
      req.params.department
    );

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interviews",
      error: error.message,
    });
  }
};

// ============================================
// GET INTERVIEWS BY INTERVIEWER
// ============================================
export const getInterviewsByInterviewer = async (req, res) => {
  try {
    const interviews = await ScheduleInterview.getByInterviewer(
      req.params.interviewer
    );

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interviews",
      error: error.message,
    });
  }
};

// ============================================
// GET UPCOMING INTERVIEWS
// ============================================
export const getUpcomingInterviews = async (req, res) => {
  try {
    const interviews = await ScheduleInterview.getUpcoming();

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming interviews",
      error: error.message,
    });
  }
};
