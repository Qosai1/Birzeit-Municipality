import { Routes, Route, Link } from "react-router-dom";
import FileUploadPage from "./FileUploadPage";
import EmployeesChart from "../component/EmployeesChart";
import EmployeesTable from "../component/EmployeesTable";
import InterviewsTable from "../component/InterviewsTable";
import Profile from "../component/Profile";
import Messages from "./Messages";
import DocumentsList from "./DocumentsList";
 import { useState } from "react";
import { HiMiniUsers } from "react-icons/hi2";
import { TbCalendarUser } from "react-icons/tb";

export default function AdminDashboard({ user }) {
    const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      

      <div className="main-content">
        <Routes>
          <Route
            index
            element={
              <>
                <div className="quick-actions">
                  <div className="action-group">
                    <h3>Employees</h3>

                    <Link to="employees" className="action-link">
                      <HiMiniUsers /> View All Employees
                    </Link>

                    <Link to="interviews" className="action-link">
                      <TbCalendarUser /> View Scheduled Interviews
                    </Link>
                  </div>
                </div>

                <div className="dashboard-row">
                  <div className="card auto-height">
                    <FileUploadPage 
                            onUploadSuccess={() => setRefreshKey(prev => prev + 1)}

                    />
                  </div>

                  <div className="card stretch-height">
                    <EmployeesChart />
                  </div>
                </div>

                <DocumentsList 
                refreshKey={refreshKey}
                />
              </>
            }
          />

          {/* ROUTES */}
          <Route path="employees" element={<EmployeesTable />} />
          <Route path="interviews" element={<InterviewsTable />} />
          <Route path="profile" element={<Profile user={user}/>} />
          <Route path="messages" element={<Messages user={user}/>} />
        </Routes>
      </div>
    </div>
  );
}
