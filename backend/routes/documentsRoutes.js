import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  getAllDocumentsByDepartment,
  softDeleteDocument,
  uploadFile,
  searchDocuments,
  semanticSearchDocuments,
  semanticSearchByDepartment,
  generateAllEmbeddings,
} from "../controllers/documentController.js";

// Storage with original extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

const router = express.Router();
// CRUD endpoints
router.get("/", getAllDocuments); // Get all documents
router.get("/:id", getDocumentById);
router.get("/department/:department", getAllDocumentsByDepartment);
router.post("/", createDocument); // Add new document
router.put("/:id/soft-delete", softDeleteDocument);
router.post("/upload", upload.single("file"), uploadFile); // File upload and text extraction

// ========== Search Routes 🔍 ==========
router.get("/search/text", searchDocuments);
router.get("/search/semantic", semanticSearchDocuments);
router.get("/search/semantic/department/:department", semanticSearchByDepartment);

// ========== Admin Routes 🔧 ==========
router.get("/admin/generate-embeddings", generateAllEmbeddings);

export default router;
