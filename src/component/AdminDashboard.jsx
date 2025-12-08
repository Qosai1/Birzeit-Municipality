import FileUploadPage from './FileUploadPage';
import { Routes, Route } from "react-router-dom";
import Profile from "../component/Profile.jsx";
import Messages from "./Messages.jsx";
export default function AdminDashboard({ user }) {
  return (
    <div>
     <Routes>
        <Route
          index
          element={
            <div>
              
              <FileUploadPage />
            
            </div>
          }
        />
          <Route path="messages" element={<Messages user={user} />} />
        <Route path="profile" element={<Profile user={user} />} />
      </Routes>
    </div>
  );
}
