import { Routes, Route } from "react-router-dom";
import FileUploadPage from "./FileUploadPage.jsx";
import Profile from "../component/Profile.jsx";
import Messages from "./Messages.jsx";
import DocumentsList from "./DocumentsList.jsx";
import "../style.css";
import { useState } from "react";

export default function EmployeeDashboard({user}) {
    const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="employee-dashboard">
   <Routes>

       
            <Route
            index
            element={
              <div>
      
                  <FileUploadPage
                   onUploadSuccess={() => setRefreshKey(prev => prev + 1)}

                  />

                 <DocumentsList
                 refreshKey={refreshKey}
                 />
                  
              </div>
            }
          />
      
          <Route path="messages" element={<Messages user={user} />} />
        <Route path="profile" element={<Profile user={user} />} />
      </Routes>
    </div>
  );
}
