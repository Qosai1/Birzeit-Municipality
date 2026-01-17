import React from "react";
import "../style.css";

export default function Notification({ type, message, onClose }) {
  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      <span className="notification-icon">
        {type === "success" ? "✅" : "❌"}
      </span>
      <p>{message}</p>
      
    </div>
  );
}
