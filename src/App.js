import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Header from "./component/Header";
import Login from "./component/LogIn";
import HrDashboard from "./component/HrDashboard";
import EmployeeDashboard from "./component/EmployeeDashboard";
import AdminDashboard from "./component/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ تحميل المستخدم من localStorage عند تشغيل التطبيق
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

  // ✅ عند تسجيل الدخول
  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("user", JSON.stringify(loggedUser));
  };

  // ✅ عند تسجيل الخروج
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <>
      {!user ? (
        // 👤 المستخدم غير مسجل الدخول → صفحة تسجيل الدخول فقط
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        // ✅ بعد تسجيل الدخول
        <>
          <Header onLogout={handleLogout} user={user} />

          <Routes>
            {/* 🧭 إعادة توجيه المستخدم حسب دوره */}
            <Route path="/" element={<Navigate to={`/${user.role}-dashboard`} />} />

            {/* ✅ كل Dashboard فيه /* لتفعيل الصفحات الفرعية */}
            <Route path="/hr-dashboard/*" element={<HrDashboard user={user} />} />
            <Route path="/employee-dashboard/*" element={<EmployeeDashboard user={user} />} />
            <Route path="/admin-dashboard/*" element={<AdminDashboard user={user} />} />

            {/* أي مسار غريب يعيد المستخدم لصفحة الداشبورد الخاصة بدوره */}
            <Route path="*" element={<Navigate to={`/${user.role}-dashboard`} />} />
          </Routes>
        </>
      )}
    </>
  );
}
