import express from "express";
import cors from "cors";
import employeesRoutes from "./routes/employees.js";
import interviewRoutes from "./routes/scheduleInterviews.js";
import documentsRoutes from "./routes/documentsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import db from "./db/connection.js";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const { fileDescription, fileContentDescription } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const query =
    "INSERT INTO documents (file_name, title, description, file_path) VALUES (?, ?, ?, ?)";
  const values = [
    file.originalname,
    fileDescription,
    fileContentDescription || "",
    file.path,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error uploading file to database.");
    }

    res.status(200).send("File uploaded successfully!");
  });
});

// All employee endpoints start with /api/employees
app.use("/api/employees", employeesRoutes);
// All interview endpoints start with /api/interviews
app.use("/api/interviews", interviewRoutes);
// All document endpoints start with /api/documents
app.use("/api/documents", documentsRoutes);

// All auth endpoints start with /api/auth
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));