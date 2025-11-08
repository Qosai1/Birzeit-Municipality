import React, { useState } from "react";
import "../style.css";

const FileUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState("");
  const [fileCategory, setFileCategory] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [fileContentDescription, setFileContentDescription] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      setFileDetails(`File Name: ${file.name}, File Size: ${file.size} bytes`);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setNotificationType("warning");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return;
    }

    setNotificationType("success");
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);

    alert(`Uploading: ${selectedFile.name}`);
  };

  return (
    <div className="file-upload-container">
      <h2>Upload a New File</h2>

      <div className="file-upload-box">
        <label htmlFor="file-upload" className="upload-icon">
          <i className="fa fa-cloud-upload-alt" aria-hidden="true"></i>
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".pdf, .doc, .docx, .jpg, .png"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {fileDetails && (
        <div className="file-details">
          <p>{fileDetails}</p>
        </div>
      )}

      <div className="form-group">
        <label>Document Type</label>
        <select
          value={fileCategory}
          onChange={(e) => setFileCategory(e.target.value)}
        >
          <option value="">Select Document Type</option>
          <option value="pdf">PDF</option>
          <option value="doc">DOC</option>
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
        </select>
      </div>

      <div className="form-group">
        <label>Document Title</label>
        <input
          type="text"
          value={fileDescription}
          onChange={(e) => setFileDescription(e.target.value)}
          placeholder="Enter the document title"
        />
      </div>

      <div className="form-group">
        <label>Document Content Description</label>
        <textarea
          value={fileContentDescription}
          onChange={(e) => setFileContentDescription(e.target.value)}
          placeholder="Enter a description of the document content"
        />
      </div>

      <button onClick={handleUpload}>Upload Document</button>

      {showNotification && (
        <div className={`notification ${notificationType}`}>
          <p>
            {notificationType === "warning"
              ? "Please select a file before uploading!"
              : "File has been successfully uploaded!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;
