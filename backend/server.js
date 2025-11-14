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

// إعداد multer لتخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // استخدام __dirname للتأكد من المسار الصحيح
    cb(null, path.join(__dirname, 'uploads')); // هنا يتم تحديد مكان تخزين الملفات
  },
  filename: (req, file, cb) => {
    // إضافة الوقت الحالي كجزء من اسم الملف لتجنب التكرار
    cb(null, Date.now() + path.extname(file.originalname)); // ضمان أن كل اسم ملف فريد
  },
});

const upload = multer({ storage });

// مسار رفع الملفات
app.post("/api/upload", upload.single("file"), (req, res) => {
  const { fileDescription, fileContentDescription } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const query = "INSERT INTO documents (file_name, title, description, file_path) VALUES (?, ?, ?, ?)";
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

// جميع المسارات الأخرى
app.use("/api/employees", employeesRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/auth", authRoutes);

// بدء الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
