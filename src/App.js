import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Header from "./component/Header";
import Details from "./component/details";
import AddEmployee from "./component/AddEmployee";
import QuickActions from "./component/QuickActions";
import Profile from "./component/Profile";
import EmployeesTableDB from "./component/EmployeesTableDB";
import Login from "./component/LogIn";
import ScheduleInterview from "./component/Schedule Interview";
import EmployeesTable from "./component/EmployeesTable";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };
    const handleLogout = () => {
    setIsLoggedIn(false);
  };
  return (
    <>
   
      {!isLoggedIn ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <>
       
          <Header onLogout={handleLogout}/>

          <Routes>
          
            <Route
              path="/"
              element={
                <div>
                  <Details />
                  <div className="dd">
                    <EmployeesTableDB />
                    <QuickActions />
                  </div>
                </div>
              }
            />

          
            <Route path="/add" element={<AddEmployee />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/employees" element={<EmployeesTable />} />
              <Route path="/schedule" element={<ScheduleInterview />} />


            {/* <Route path="*" element={<Navigate to="/" />} /> */}
          </Routes>
        </>
      )}
    </>
  );
}
