import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';


import Header from "./component/Header";
import Login from "./component/LogIn";
import HrDashboard from "./component/HrDashboard";
import EmployeeDashboard from "./component/EmployeeDashboard";
import AdminDashboard from "./component/AdminDashboard";
import DocumentSearch from './component/DocumentSearch';

export default function App() {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);


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
  
  const handleSearch = async (searchParams) => {
    try {
      const response = await axios.get('/documents', { params: searchParams });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents', error);
    }
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
            <Route path="/hr-dashboard/DocumentSearch" element={<DocumentSearch onSearch={handleSearch} />} />

          </Routes>
        </>
      )}
    </>
  );
}
