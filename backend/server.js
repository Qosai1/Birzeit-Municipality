import express from "express";
import cors from "cors";
import employeesRoutes from "./routes/employees.js";
import interviewRoutes from "./routes/scheduleInterviews.js";
import documentsRoutes from "./routes/documentsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import db from "./db/connection.js";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { elasticsearchService } from "./services/ElasticsearchService.js";

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*  FILE UPLOAD  */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

/*  HTTP + SOCKET  */

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/*  USER SOCKET MAP  */

const userSockets = new Map(); // userId => Set(socketId)

const getSocketsOfUser = (userId) =>
  userSockets.get(Number(userId)) || new Set();

/*  SOCKET LOGIC  */

io.on("connection", (socket) => {
  console.log(" Connected:", socket.id);

  socket.on("register_user", (userId) => {
    const uid = Number(userId);

    if (!userSockets.has(uid)) {
      userSockets.set(uid, new Set());
    }

    userSockets.get(uid).add(socket.id);
    socket.userId = uid;

    console.log(" User registered:", uid);
  });

  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on("disconnect", () => {
    if (socket.userId && userSockets.has(socket.userId)) {
      userSockets.get(socket.userId).delete(socket.id);

      if (userSockets.get(socket.userId).size === 0) {
        userSockets.delete(socket.userId);
      }
    }
  });
});

/*  CHAT APIS  */

//  Get departments
app.get("/api/departments", async (_, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT TRIM(department) AS department
      FROM employees
      WHERE department IS NOT NULL AND TRIM(department) != ''
    `);
    res.json(rows);
  } catch {
    res.status(500).send("Error fetching departments");
  }
});

// Get employees by department
app.get("/api/employees/department/:dep", async (req, res) => {
  try {
    const dep = req.params.dep.toLowerCase();
    const [rows] = await db.query(
      `
      SELECT id, fullName, role
      FROM employees
      WHERE LOWER(TRIM(department)) = ? AND isActive = 1
    `,
      [dep]
    );
    res.json(rows);
  } catch {
    res.status(500).send("Error fetching employees");
  }
});

//  Start conversation
app.post("/api/conversations/start", async (req, res) => {
  const { user1, user2 } = req.body;

  const [existing] = await db.query(
    `
    SELECT c.id FROM conversations c
    JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
    JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = ?
  `,
    [user1, user2]
  );

  if (existing.length) return res.json({ conversationId: existing[0].id });

  const [conv] = await db.query(`INSERT INTO conversations () VALUES ()`);
  const cid = conv.insertId;

  await db.query(
    `
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (?, ?), (?, ?)
  `,
    [cid, user1, cid, user2]
  );

  res.json({ conversationId: cid });
});

// Get user conversations
app.get("/api/conversations/user/:id", async (req, res) => {
  const userId = req.params.id;

  const [rows] = await db.query(
    `
    SELECT
      c.id AS conversationId,
      e.fullName AS otherUser,
      e.role AS otherRole
    FROM conversations c
    JOIN conversation_participants cp1 ON cp1.conversation_id = c.id
    JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id != cp1.user_id
    JOIN employees e ON e.id = cp2.user_id
    WHERE cp1.user_id = ?
  `,
    [userId]
  );

  res.json(rows);
});

//  Get messages
app.get("/api/messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  const [rows] = await db.query(
    `
    SELECT m.*, e.fullName AS senderName
    FROM messages m
    JOIN employees e ON e.id = m.sender_id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `,
    [conversationId]
  );

  res.json(rows);
});

//   Send message ()
app.post(
  "/api/messages/:conversationId",
  upload.single("file"),
  async (req, res) => {
    const convId = Number(req.params.conversationId);
    const senderId = Number(req.body.senderId);
    const text = req.body.text || null;

    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;

    const [r] = await db.query(
      `
      INSERT INTO messages (conversation_id, sender_id, text, file_path, file_name)
      VALUES (?, ?, ?, ?, ?)
    `,
      [convId, senderId, text, filePath, fileName]
    );

    const message = {
      id: r.insertId,
      conversation_id: convId,
      sender_id: senderId,
      text,
      file_path: filePath,
      file_name: fileName,
      created_at: new Date().toISOString(),
    };

    io.to(`conversation_${convId}`).emit("new_message", message);

    res.json({ sent: true });
  }
);

/*  OTHER ROUTES  */

app.use("/api/employees", employeesRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/auth", authRoutes);

/*  INITIALIZATION  */

// Initialize Elasticsearch on startup
(async () => {
  try {
    // Initialize Elasticsearch (semantic search) - optional
    const elasticInitialized = await elasticsearchService.initialize();

    console.log("✓ Search services initialized");
    if (elasticInitialized) {
      console.log("  → Semantic search (Elasticsearch): Available");
    } else {
      console.log("  → Semantic search (Elasticsearch): Not available");
    }
  } catch (err) {
    console.error("⚠️  Initialization warning:", err.message);
  }
})();

/*  START  */

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
