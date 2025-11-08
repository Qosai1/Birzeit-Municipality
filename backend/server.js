import express from "express";
import cors from "cors";
import employeesRoutes from "./routes/employees.js";
import interviewRoutes from "./routes/scheduleInterviews.js";
import documentsRoutes from "./routes/documentsRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// All employee endpoints start with /api/employees
app.use("/api/employees", employeesRoutes);
// All interview endpoints start with /api/interviews
app.use("/api/interviews", interviewRoutes);
// All document endpoints start with /api/documents
app.use("/api/documents", documentsRoutes);

// All auth endpoints start with /api/auth
//app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
