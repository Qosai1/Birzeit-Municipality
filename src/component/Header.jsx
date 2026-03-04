import { Link } from "react-router-dom";
import "../style.css";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

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
  
  const [banner, setBanner] = useState({ show: false, text: "", sender: "" });
  const notificationAudio = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const audio = new Audio("/message.wav");
    audio.volume = 0;
    notificationAudio.current = audio;

    const unlockAudio = () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      }).catch(() => {});
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);

    const calcUnread = () => {
      const data = JSON.parse(localStorage.getItem("unreadMessages")) || {};
      const total = Object.values(data).reduce((sum, v) => sum + v, 0);
      setUnreadCount(total);
    };
    calcUnread();

    const socket = io(SOCKET_URL, { transports: ["polling", "websocket"] });
    socket.emit("register_user", Number(user.id));

    socket.on("new_message", (msg) => {
      if (Number(msg.sender_id) !== Number(user.id)) {
        notificationAudio.current?.play().catch(() => {});

        if (!window.location.pathname.includes("/messages")) {
          setBanner({ show: true, text: msg.text, sender: msg.senderName || "New Message" });
          
          setTimeout(() => setBanner({ show: false, text: "", sender: "" }), 7000);

          const data = JSON.parse(localStorage.getItem("unreadMessages")) || {};
          const convId = Number(msg.conversation_id);
          data[convId] = (data[convId] || 0) + 1;
          localStorage.setItem("unreadMessages", JSON.stringify(data));
          calcUnread();
        }
      }
    });

    window.addEventListener("unreadUpdated", calcUnread);
    window.addEventListener("storage", calcUnread);

    return () => {
      socket.disconnect();
      window.removeEventListener("unreadUpdated", calcUnread);
      window.removeEventListener("storage", calcUnread);
      window.removeEventListener("click", unlockAudio);
    };
  }, [user?.id]);

  return (
    <>
      {/* (Notification Pop-up) */}
      {banner.show && (
        <div className="global-notification-banner">
          <div className="banner-content">
            <strong>{banner.sender}</strong>
            <p>{banner.text?.substring(0, 30)}{banner.text?.length > 30 ? "..." : ""}</p>
          </div>
          <Link to={chatPath} onClick={() => setBanner({show:false})}>Reply</Link>
        </div>
      )}

      <header className="header">
        <div className="logo">
          <h2>Birzeit Municipality</h2>
        </div>

        <nav className="nav-links">
          <Link to={dashboardPath} className="nav-link">Home</Link>
          <Link to={`${dashboardPath}/profile`} className="nav-link">Profile</Link>
          <Link to={chatPath} className="nav-link chat-link">
            Chat
            {unreadCount > 0 && (
              <span className="chat-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>
    </>
  );
}