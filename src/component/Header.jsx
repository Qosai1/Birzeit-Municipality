import { Link } from "react-router-dom";
import "../style.css";
import { useEffect, useState } from "react";
export default function Header({ user, onLogout }) {

  const dashboardPath =
    user?.role === "HR"
      ? "/hr-dashboard"
      : user?.role === "employee"
      ? "/employee-dashboard"
      : user?.role === "admin"
      ? "/admin-dashboard"
      : "/";

  const chatPath = `${dashboardPath}/messages`;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const calcUnread = () => {
      const data = JSON.parse(localStorage.getItem("unreadMessages")) || {};
      const total = Object.values(data).reduce((sum, v) => sum + v, 0);
      setUnreadCount(total);
    };

    calcUnread();

    window.addEventListener("storage", calcUnread);
    return () => window.removeEventListener("storage", calcUnread);
  }, []);
  return (
    <header className="header">
      <div className="logo">
        <h2>Birzeit Municipality</h2>
      </div>

      <nav className="nav-links">
        <Link to={dashboardPath} className="nav-link">
          Home
        </Link>

        <Link to={`${dashboardPath}/profile`} className="nav-link">
          Profile
        </Link>

        {/* 🔥 زر الشات */}
        <Link to={chatPath} className="nav-link chat-link">
  Chat
  {unreadCount > 0 && (
    <span className="chat-badge">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  )}
</Link>

      </nav>

      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
}
