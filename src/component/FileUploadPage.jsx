import React, { useState } from "react";
import "../style.css";

const FileUploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [fileDescription, setFileDescription] = useState("");
  const [fileContentDescription, setFileContentDescription] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isFolderUpload, setIsFolderUpload] = useState(false);

  // دالة لاختيار الملفات
  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(files[0]);
  };

  // دالة لتحميل الملف إلى الخادم
  const handleUpload = async () => {
    if (!fileDescription) {
      setNotificationType("warning");
      setNotificationMessage("Please enter a document title before uploading.");
      setShowNotification(true);
      return;
    }

    if (!selectedFiles) {
      setNotificationType("warning");
      setNotificationMessage("Please select a file before uploading.");
      setShowNotification(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFiles);
    formData.append("fileDescription", fileDescription);
    formData.append("fileContentDescription", fileContentDescription);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNotificationType("success");
        setNotificationMessage("File uploaded successfully!");
      } else {
        setNotificationType("error");
        setNotificationMessage("Failed to upload the file.");
      }
    } catch (error) {
      setNotificationType("error");
      setNotificationMessage("Failed to upload the file.");
    }

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Files</h2>

      {/* خيار رفع الملف أو المجلد */}
      <div className="form-group upload-option">
        <label>Choose Upload Option</label>
        <div className="upload-options">
          <label
            className={`upload-option-label ${!isFolderUpload ? "active" : ""}`}
          >
            <input
              type="radio"
              name="uploadOption"
              checked={!isFolderUpload}
              onChange={() => setIsFolderUpload(false)}
            />
            Upload File
          </label>
          <label
            className={`upload-option-label ${isFolderUpload ? "active" : ""}`}
          >
            <input
              type="radio"
              name="uploadOption"
              checked={isFolderUpload}
              onChange={() => setIsFolderUpload(true)}
            />
            Upload Folder
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Document Title</label>
        <input
          type="text"
          value={fileDescription}
          onChange={(e) => setFileDescription(e.target.value)}
          placeholder="Enter the document title"
          required
        />
      </div>

      <div className="form-group">
        <label>Document Content Description (Optional)</label>
        <textarea
          value={fileContentDescription}
          onChange={(e) => setFileContentDescription(e.target.value)}
          placeholder="Enter the document content description"
        />
      </div>

      <div className="file-upload-box">
        <label htmlFor="file-upload" className="upload-icon">
          <i className="fa fa-cloud-upload-alt" aria-hidden="true"></i>
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".pdf, .doc, .docx, .jpg, .png"
          onChange={handleFileChange}
          webkitdirectory={isFolderUpload ? "true" : undefined}
          style={{ display: "none" }}
        />
      </div>

      <button className="upload-btn" onClick={handleUpload}>
        Upload Documents
      </button>

      {showNotification && (
        <div className={`notification ${notificationType}`}>
          <p>{notificationMessage}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;