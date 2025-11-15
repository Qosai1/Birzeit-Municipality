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
import { fileURLToPath } from "url";

// لحل مشكلة __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ⭐⭐ أهم سطر لتصحيح مشكلة Cannot GET /uploads ⭐⭐
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// إعداد multer لتخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // اسم فريد
  },
});

const upload = multer({ storage });

// 📌 API رفع الملفات
app.post("/api/upload", upload.single("file"), (req, res) => {
  const { fileDescription, fileContentDescription, employee_name, employee_id, department } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  // تخزين المسار الصحيح في قاعدة البيانات
  const filePath = `uploads/${file.filename}`;

  const query = `
    INSERT INTO documents (file_name, title, description, file_path, employee_name, employee_id, department)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    file.originalname,
    fileDescription || "",
    fileContentDescription || "",
    `uploads/${file.filename}`,
    employee_name || "",
    employee_id || null,
    department || "",
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error uploading file to database.");
    }

    res.status(200).send("File uploaded successfully!");
  });
});

// جميع المسارات الأخرى
app.use("/api/employees", employeesRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/auth", authRoutes);

// بدء الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
