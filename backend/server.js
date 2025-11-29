import express from "express";
import cors from "cors";
import employeesRoutes from "./routes/employees.js";
import interviewRoutes from "./routes/scheduleInterviews.js";
import documentsRoutes from "./routes/documentsRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const require = createRequire(import.meta.url);
// let pdfParse;

// try {
//   const pdfModule = require("pdf-parse");
//   pdfParse = typeof pdfModule === "function" ? pdfModule : pdfModule.default;
// } catch (error) {
//   console.log(
//     "Note: PDF parsing unavailable. Install with: npm install pdf-parse"
//   );
// }

const app = express();
app.use(cors());
app.use(express.json());

// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }
// app.use("/uploads", express.static(uploadsDir));

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(
//       Math.random() * 1e9
//     )}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif|bmp|tiff/;
//     const extname = allowedTypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (extname && mimetype) {
//       cb(null, true);
//     } else {
//       cb(new Error("Please upload a PDF, Word document, or image file"));
//     }
//   },
// });

// async function extractWord(filePath) {
//   try {
//     const result = await mammoth.extractRawText({ path: filePath });
//     return result.value || "This document appears to be empty";
//   } catch (error) {
//     return `Could not read Word document: ${error.message}`;
//   }
// }

// async function extractFileContent(filePath, fileName) {
//   const ext = path.extname(fileName).toLowerCase();

//   try {
//     if (ext === ".pdf") {
//       return await extractPDF(filePath);
//     } else if (ext === ".doc" || ext === ".docx") {
//       return await extractWord(filePath);
//     } else if (
//       [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"].includes(ext)
//     ) {
//       return await extractImage(filePath);
//     } else {
//       return "This file type is not supported for text extraction";
//     }
//   } catch (error) {
//     return `Could not process this file: ${error.message}`;
//   }
// }

// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   const {
//     fileDescription,
//     fileContentDescription,
//     employee_name,
//     employee_id,
//     department,
//   } = req.body;

//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: "No file was uploaded" });
//   }

//   const filePath = path.join(__dirname, "uploads", file.filename);

//   let extractedText = "";
//   try {
//     extractedText = await extractFileContent(filePath, file.originalname);
//   } catch (err) {
//     console.error("Error extracting text:", err);
//     extractedText = "Content extraction was unsuccessful";
//   }

//   const query = `
//     INSERT INTO documents
//     (file_name, title, description, file_path, employee_name, employee_id, department)
//     VALUES (?, ?, ?, ?, ?, ?, ?)
//   `;

//   const values = [
//     file.originalname,
//     fileDescription || file.originalname,
//     fileContentDescription || "",
//     `uploads/${file.filename}`,
//     employee_name || "",
//     employee_id || null,
//     department || "",
//     extractedText,
//   ];

//   db.query(query, values, (err, result) => {
//     if (err) {
//       console.error("Database error:", err);

//       try {
//         fs.unlinkSync(filePath);
//       } catch (unlinkErr) {
//         console.error("Could not delete file:", unlinkErr);
//       }

//       return res.status(500).json({ error: "Could not save file to database" });
//     }
//     console.log("extracted test: ", extractedText);
//     res.status(200).json({
//       message: "File uploaded successfully",
//       fileId: result.insertId,
//       fileName: file.originalname,
//       extractedText:
//         extractedText.substring(0, 200) +
//         (extractedText.length > 200 ? "..." : ""),
//     });
//   });
// });

app.use("/api/employees", employeesRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
