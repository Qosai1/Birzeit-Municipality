import express from "express";
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();
// CRUD endpoints
router.get("/", getAllDocuments); // Get all documents
router.get("/:id", getDocumentById);
router.post("/", createDocument); // Add new document
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

export default router;
