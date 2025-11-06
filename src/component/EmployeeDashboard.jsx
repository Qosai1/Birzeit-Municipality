import { Routes, Route } from "react-router-dom";
import FileUploadPage from "./FileUploadPage.jsx";
import Profile from "../component/Profile.jsx";

import "../style.css";

export default function EmployeeDashboard({ user }) {
  return (
    <div className="employee-dashboard">

      <Routes>
        <Route
          index
          element={
            <div>
              
              <FileUploadPage />
            </div>
          }
        />
        <Route path="profile" element={<Profile user={user} />} />
      </Routes>
    </div>
  );
}
