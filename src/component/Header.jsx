import { Link } from "react-router-dom";
import "../style.css"

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <h2>Birzeit Municipality</h2>
      </div>

      <nav className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/profile" className="nav-link">
          Profile
        </Link>
      </nav>

      <button className="logout-btn">Logout</button>
    </header>
  );
}
