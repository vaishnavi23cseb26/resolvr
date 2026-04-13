const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { initSocket } = require("./services/socketService");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");

// Load .env in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const server = http.createServer(app);

// ✅ YOUR FRONTEND URL (VERY IMPORTANT)
const FRONTEND_URL = "https://resolver-frontend-iota.vercel.app";

// ✅ SOCKET.IO FIXED CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

initSocket(io);

io.on("connection", (socket) => {
  socket.on("join", ({ userId }) => {
    if (userId) socket.join(String(userId));
  });
});

// ✅ EXPRESS CORS FIX
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: { ok: true },
    message: "OK",
    error: ""
  });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);

// ✅ Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ✅ Start server
(async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();