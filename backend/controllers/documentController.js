import Document from "../models/document.js";

// get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.getAll();
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: err.message,
    });
  }
};

// get document by id
export const getDocumentById = async (req, res) => {
  try {
    const id = req.params.id;
    const document = await Document.getById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    res.status(200).json(document);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching document",

      error: err.message,
    });
  }
};

// create new document
export const createDocument = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const file = req.file;

    const {
      title,
      description,
      employee_name,
      employee_id,
      department,
      uploaded_at  
    } = req.body;

    const documentData = {
      file_name: file.originalname,
      file_path: file.path,
      title,
      description,
      employee_name,
      employee_id,
      department,
      uploaded_at 
    };

    const newDocId = await Document.create(documentData);

    res.status(201).json({
      success: true,
      message: "Document created successfully",
      document_id: newDocId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// update document
export const updateDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const documentData = req.body;
    const affectedRows = await Document.update(id, documentData);
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found or no changes made",
      });
    }
    res.status(200).json({
      success: true,
      message: "Document updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      message: "Error updating document",
      error: err.message,
    });
  }
};

// delete document
export const deleteDocument = async (req, res) => {
  try {
    const id = req.params.id;

    const affectedRows = await Document.delete(id);
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: err.message,
    });
  }
};
