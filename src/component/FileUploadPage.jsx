import React, { useEffect, useState } from "react";
import "../style.css";
import Notification from "./Notification";
import DocumentsList from "./DocumentsList";

const FileUploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [fileDescription, setFileDescription] = useState("");
  const [fileContentDescription, setFileContentDescription] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isFolderUpload, setIsFolderUpload] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(files[0]);
  };

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
    formData.append("employee_name", user.fullName);
    formData.append("employee_id", user.id);
    formData.append("department", user.department);

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
    <>
    <div className="file-upload-container">
      <h2>Upload Files</h2>

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
        <Notification
          type={notificationType}
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
     
    </div>
    <div>
      <DocumentsList />
    </div>
    </>
  );
};

export default FileUploadPage;
