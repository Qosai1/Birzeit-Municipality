import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../style.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const user = data.user;
        onLogin(user);

        if (user.role === "HR") navigate("/hr-dashboard");
        else if (user.role === "employee") navigate("/employee-dashboard");
        else if (user.role === "admin") navigate("/admin-dashboard");
        else navigate("/");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="login-page-animated">
      <div className="login-box-animated">
        <FaUserCircle className="login-icon-animated" />
        <h2 className="welcome-title-animated">Welcome Back!</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input-animated"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input-animated"
          />
          <button type="submit" className="login-btn-animated">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
