import React, { useState } from "react";
import "../style.css";

const FileUploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileDetails, setFileDetails] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [fileContentDescription, setFileContentDescription] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("");
  const [isFolderUpload, setIsFolderUpload] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(files);

    if (files.length > 0) {
      const details = Array.from(files)
        .map((file) => `File Name: ${file.name}, File Size: ${file.size} bytes`)
        .join("\n");
    }
  };

  const handleUpload = () => {
    if (!fileDescription) {
      setWarningMessage("Please enter a document title before uploading.");
      return;
    }

    if (selectedFiles.length === 0) {
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

    alert(`Uploading ${selectedFiles.length} files...`);
  };

  return (
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
            Upload Files
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

      <div className="file-upload-box">
        <label htmlFor="file-upload" className="upload-icon">
          <i className="fa fa-cloud-upload-alt" aria-hidden="true"></i>
        </label>

        <input
          type="file"
          id="file-upload"
          accept=".pdf, .doc, .docx, .jpg, .png"
          onChange={handleFileChange}
          multiple={!isFolderUpload}
          webkitdirectory={isFolderUpload ? "true" : undefined}
          style={{ display: "none" }}
        />
      </div>

      {fileDetails && (
        <div className="file-details">
          <p>{fileDetails}</p>
        </div>
      )}

      {/* Title - Required */}
      <div className="form-group">
        <label>
          Document Title <span className="required">*</span>
        </label>
        <input
          type="text"
          value={fileDescription}
          onChange={(e) => setFileDescription(e.target.value)}
          placeholder="Enter the document title"
          required
        />
      </div>

      {/* Description - Optional */}
      <div className="form-group">
        <label>
          Document Content Description{" "}
          <span className="optional">(Optional)</span>
        </label>
        <textarea
          value={fileContentDescription}
          onChange={(e) => setFileContentDescription(e.target.value)}
          placeholder="Enter a description of the document content (Optional)"
        />
      </div>

      {warningMessage && (
        <div className="warning-message">{warningMessage}</div>
      )}

      <button className="upload-btn" onClick={handleUpload}>
        Upload Documents
      </button>

      {showNotification && (
        <div className={`notification ${notificationType}`}>
          <p>
            {notificationType === "warning"
              ? "Please select files before uploading!"
              : "Files have been successfully uploaded!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;
