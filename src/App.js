import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Header from "./component/Header";
import Login from "./component/LogIn";
import HrDashboard from "./component/HrDashboard";
import EmployeeDashboard from "./component/EmployeeDashboard";
import AdminDashboard from "./component/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("user", JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <>
          <Header onLogout={handleLogout} user={user} />

          <Routes>
            <Route path="/" element={<Navigate to={`/${user.role}-dashboard`} />} />

            <Route path="/hr-dashboard/*" element={<HrDashboard user={user} />} />
            <Route path="/employee-dashboard/*" element={<EmployeeDashboard user={user} />} />
            <Route path="/admin-dashboard/*" element={<AdminDashboard user={user} />} />

            <Route path="*" element={<Navigate to={`/${user.role}-dashboard`} />} />
          </Routes>
        </>
      )}
    </>
  );
}
