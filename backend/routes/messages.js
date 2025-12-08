import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "../style.css";

const API = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

export default function Messages({ user }) {
  const userId = user?.id;

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [unread, setUnread] = useState({});
  const [banner, setBanner] = useState(null);

  const socketRef = useRef(null);
  const currentRoomRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ================= CONNECT SOCKET ================= */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  /* ================= SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const onMessage = (msg) => {
      const convId = Number(msg.conversation_id);
      console.log("SOCKET MSG:", convId, "ACTIVE:", selectedConversation);

      if (convId === selectedConversation) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnread((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));

        setBanner("📩 New message");
        setTimeout(() => setBanner(null), 2000);
      }
    };

    socket.on("new_message", onMessage);
    return () => socket.off("new_message", onMessage);
  }, [selectedConversation]);

  /* ================= JOIN / LEAVE ROOM ================= */
  useEffect(() => {
    if (!socketRef.current || !selectedConversation) return;

    const socket = socketRef.current;

    // leave old room
    if (currentRoomRef.current) {
      socket.emit("leave_conversation", currentRoomRef.current);
    }

    // join new room
    socket.emit("join_conversation", selectedConversation);
    currentRoomRef.current = selectedConversation;

    console.log("JOINED:", selectedConversation);
  }, [selectedConversation]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetch(`${API}/departments`)
      .then((res) => res.json())
      .then(setDepartments);
  }, []);

  useEffect(() => {
    if (!selectedDept) return;
    fetch(`${API}/employees/department/${selectedDept}`)
      .then((res) => res.json())
      .then(setUsers);
  }, [selectedDept]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/conversations/user/${userId}`)
      .then((res) => res.json())
      .then(setConversations);
  }, [userId]);

  /* ================= OPEN CHAT ================= */
  const openChat = async (conversationId) => {
    const convId = Number(conversationId);

    setSelectedConversation(convId);
    setUnread((prev) => ({ ...prev, [convId]: 0 }));

    const res = await fetch(`${API}/messages/${convId}`);
    const data = await res.json();
    setMessages(data);
  };

  /* ================= START CHAT ================= */
  const startConversation = async () => {
    if (!selectedUser) return;

    const res = await fetch(`${API}/conversations/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1: userId, user2: selectedUser }),
    });

    const data = await res.json();
    openChat(data.conversationId);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!selectedConversation || (!text && !file)) return;

    const form = new FormData();
    form.append("senderId", userId);
    if (text) form.append("text", text);
    if (file) form.append("file", file);

    await fetch(`${API}/messages/${selectedConversation}`, {
      method: "POST",
      body: form,
    });

    setText("");
    setFile(null);
  };

  return (
    <div className="messages-page">
      {banner && <div className="notification-banner">{banner}</div>}

      {/* ================= SIDEBAR ================= */}
      <div className="sidebar">
        <h3>Chats</h3>

        <div className="chat-list">
          {conversations.map((c) => {
            const convId = Number(c.conversationId);
            return (
              <div
                key={convId}
                className={`chat-item ${
                  selectedConversation === convId ? "active" : ""
                }`}
                onClick={() => openChat(convId)}
              >
                <div className="chat-name-row">
                  <span>{c.otherUser}</span>
                  {unread[convId] > 0 && <span className="unread-dot"></span>}
                </div>
                <div className="chat-role">{c.otherRole}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= CHAT ================= */}
      <div className="chat-window">
        {selectedConversation ? (
          <>
            <div className="messages-area">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${
                    msg.sender_id === userId ? "me" : "other"
                  }`}
                >
                  <div className="bubble">{msg.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="placeholder">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
