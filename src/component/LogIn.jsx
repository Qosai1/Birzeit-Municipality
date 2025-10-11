import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "../style.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "qosai" && password === "1234") {
      onLogin();
    } else {
      alert("Invalid username or password");
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
