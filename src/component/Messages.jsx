import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "../style.css";

const API = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

export default function Messages({ user }) {
  const userId = Number(user?.id);

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [openedImage, setOpenedImage] = useState(null);

  const [unread, setUnread] = useState(() => {
    const saved = localStorage.getItem("unreadMessages");
    return saved ? JSON.parse(saved) : {};
  });

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const notificationAudio = useRef(null);

  /*  LOCAL STORAGE  */
  useEffect(() => {
    localStorage.setItem("unreadMessages", JSON.stringify(unread));
  }, [unread]);

  /*  AUDIO  */
  useEffect(() => {
    const audio = new Audio("/message.wav");
    audio.volume = 0;
    notificationAudio.current = audio;

    const unlockAudio = () => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
        })
        .catch(() => {});
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  /*  SOCKET CONNECT  */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
    });
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  /*  REGISTER USER  */
  useEffect(() => {
    if (socketRef.current && userId) {
      socketRef.current.emit("register_user", userId);
    }
  }, [userId]);

  /*  SOCKET LISTENER  */
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    const onNewMessage = (msg) => {
      const convId = Number(msg.conversation_id);

      if (Number(msg.sender_id) === userId) return;

      notificationAudio.current?.play().catch(() => {});

      if (convId === selectedConversation) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnread((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));
      }
    };

    socket.on("new_message", onNewMessage);
    return () => socket.off("new_message", onNewMessage);
  }, [selectedConversation, userId]);

  /*  FETCH CONVERSATIONS  */
  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/conversations/user/${userId}`)
      .then((res) => res.json())
      .then(setConversations);
  }, [userId]);
   /*  FETCH DEPARTMENTS & USERS */
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

  /*  FETCH CONVERSATIONS  */
  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/conversations/user/${userId}`)
      .then((res) => res.json())
      .then(setConversations);
  }, [userId]);

 /*  START NEW CONVERSATION */
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
  /*  JOIN ROOMS  */
  useEffect(() => {
    if (!socketRef.current) return;
    conversations.forEach((c) =>
      socketRef.current.emit("join_conversation", Number(c.conversationId))
    );
  }, [conversations]);

  /*  OPEN CHAT  */
  const openChat = async (conversationId) => {
    const convId = Number(conversationId);
    setSelectedConversation(convId);

    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[convId];
      return updated;
    });

    const res = await fetch(`${API}/messages/${convId}`);
    const data = await res.json();
    setMessages(data);
  };

  /*  SEND MESSAGE  */
  const sendMessage = async () => {
    if (!selectedConversation || (!text && !file)) return;

    const form = new FormData();
    form.append("senderId", userId);
    if (text) form.append("text", text);
    if (file) form.append("file", file);

    const optimistic = {
      id: Date.now(),
      conversation_id: selectedConversation,
      sender_id: userId,
      text: text || null,
      file_path: file ? URL.createObjectURL(file) : null,
      file_name: file?.name,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);

    await fetch(`${API}/messages/${selectedConversation}`, {
      method: "POST",
      body: form,
    });

    setText("");
    setFile(null);
  };

  /*  DELETE CONVERSATION  */
  const deleteConversation = async () => {
    if (!selectedConversation) return;
    if (!window.confirm("Delete this conversation?")) return;

    await fetch(`${API}/conversations/${selectedConversation}`, {
      method: "DELETE",
    });

    setConversations((prev) =>
      prev.filter(
        (c) => Number(c.conversationId) !== selectedConversation
      )
    );

    setSelectedConversation(null);
    setMessages([]);

    setUnread((prev) => {
      const copy = { ...prev };
      delete copy[selectedConversation];
      return copy;
    });
  };

  /*  AUTOSCROLL  */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  /*  UI  */
  return (
    <div className="messages-page">
      {/*  SIDEBAR  */}
      <div className="sidebar">
        <h3>Chats</h3>

        {/* START NEW CHAT */}
        <div className="start-chat">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedUser("");
            }}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.department} value={d.department}>
                {d.department}
              </option>
            ))}
          </select>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={!selectedDept}
          >
            <option value="">Select Employee</option>
            {users.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>
        <button className="btnStart" onClick={startConversation} disabled={!selectedUser}>
            Start
          </button>
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
                  <div className="chat-text">
                    <div className="chat-name">{c.otherUser}</div>
                    <div className="chat-department">{c.otherRole}</div>
                  </div>
                  {unread[convId] > 0 && (
                    <span className="unread-badge">
                      {unread[convId] > 9 ? "9+" : unread[convId]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*  CHAT WINDOW  */}
      <div className="chat-window">
        {selectedConversation ? (
          <>
            {/* HEADER */}
            <div className="chat-header">
              <button className="delete-chat-btn" onClick={deleteConversation}>
                Delete Chat
              </button>
            </div>

            <div className="messages-area">
              {messages.map((msg) => {
                const src = msg.file_path
                  ? msg.file_path.startsWith("blob:")
                    ? msg.file_path
                    : `http://localhost:5000${msg.file_path}`
                  : null;

                return (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.sender_id === userId ? "me" : "other"
                    }`}
                  >
                    <div className="bubble">
                      {msg.text && <p>{msg.text}</p>}

                      {src && /\.(jpg|jpeg|png|gif)$/i.test(src) && (
                        <img
                          src={src}
                          className="chat-image"
                          onClick={() => setOpenedImage(src)}
                        />
                      )}

                      {src && !/\.(jpg|jpeg|png|gif)$/i.test(src) && (
                        <a href={src} target="_blank" rel="noreferrer">
                          📎 {msg.file_name}
                        </a>
                      )}

                      <span className="message-time">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                value={text}
                placeholder="Type a message..."
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button
                className="file-btn"
                onClick={() =>
                  document.getElementById("file-input").click()
                }
              >
                📎
              </button>

              <input
                id="file-input"
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="placeholder">Select a conversation</div>
        )}
      </div>

      {/* IMAGE VIEWER */}
      {openedImage && (
        <div className="image-viewer" onClick={() => setOpenedImage(null)}>
          <img
            src={openedImage}
            className="viewer-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
