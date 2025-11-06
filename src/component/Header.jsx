import { Link } from "react-router-dom";
import "../style.css";

export default function Header({ user, onLogout }) {
 
  const dashboardPath =
    user?.role === "HR"
      ? "/hr-dashboard"
      : user?.role === "employee"
      ? "/employee-dashboard"
      : user?.role === "admin"
      ? "/admin-dashboard"
      : "/";

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
      </nav>

 
       
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
    </header>
  );
}
