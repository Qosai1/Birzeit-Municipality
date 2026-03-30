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
// IMPORTANT: keep specific routes before "/:id"

// File upload and extraction
router.post("/upload", upload.single("file"), uploadFile);

// ========== Search Routes 🔍 ==========
router.get("/search/semantic", semanticSearchDocuments);
router.get(
  "/search/semantic/department/:department",
  semanticSearchByDepartment,
);

// ========== Admin Routes 🔧 ==========
router.get("/admin/generate-embeddings", generateAllEmbeddings);

// CRUD endpoints
router.get("/", getAllDocuments); // Get all documents
router.get("/department/:department", getAllDocumentsByDepartment);
router.get("/:id", getDocumentById);
router.post("/", createDocument); // Add new document (deprecated)
router.put("/:id/soft-delete", softDeleteDocument);

export default router;
