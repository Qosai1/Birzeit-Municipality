import { Routes, Route } from "react-router-dom";
import AddEmployee from "../component/AddEmployee";
import Profile from "../component/Profile";
import EmployeesTable from "../component/EmployeesTable";
import ScheduleInterview from "../component/Schedule Interview";
import InterviewsTable from "../component/InterviewsTable";
import InterviewCalendar from "../component/InterviewCalendar";
import QuickActions from "../component/QuickActions";
import Details from "./details";
import EmployeesChart from "../component/EmployeesChart";
import FileUploadPage from "./FileUploadPage";
import DocumentsList from "./DocumentsList";
import Messages from "./Messages";

export default function HrDashboard({ user }) {
  return (
    <div className="hr-dashboard">
      <div className="dashboard-content">
        <Routes>

          <Route
            index
            element={
              <div>
                <Details user={user} />
                <QuickActions />
              
                 <div className="dashboard-row">
                 <div className="card auto-height">
                        <FileUploadPage />
                  </div>

                 <div className="card stretch-height">
                        <EmployeesChart />
                    </div>
                   </div>

                 <DocumentsList />
                  
              </div>
            }
          />

        
          <Route path="add" element={<AddEmployee />} />
          <Route path="employees" element={<EmployeesTable />} />
          <Route path="schedule" element={<ScheduleInterview />} />
          <Route path="interviews" element={<InterviewsTable />} />
          <Route path="calendar" element={<InterviewCalendar />} />
          <Route path="Documents" element={<FileUploadPage />} />
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="messages" element={<Messages user={user} />} />

        </Routes>
      </div>
    </div>
  );
}
