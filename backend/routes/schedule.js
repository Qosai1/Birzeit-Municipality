import express from "express";
import {
  getAllInterviews,
  getInterviewById,
  addInterview,
  updateInterview,
  deleteInterview,
} from "../controllers/scheduleController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllInterviews); // Get all interviews
router.get("/:id", getInterviewById); // Get single interview
router.post("/", addInterview); // Add new interview
router.put("/:id", updateInterview); // Update interview
router.delete("/:id", deleteInterview); // Delete interview

export default router;
