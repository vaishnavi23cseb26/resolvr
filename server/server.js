const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { initCloudinary } = require("./config/cloudinary");
const { initSocket } = require("./services/socketService");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");

if (process.env.NODE_ENV !== "production") {
  // Load local env only in development
  // eslint-disable-next-line global-require
  require("dotenv").config();
}

const app = express();
const server = http.createServer(app);

function buildCorsOrigin() {
  const isProd = process.env.NODE_ENV === "production";
  const configured = process.env.CLIENT_URL;

  if (isProd) return configured;

  // Dev convenience: allow Vite ports (517x) + configured origin
  const allowed = new Set([configured].filter(Boolean));
  return (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server / curl
    try {
      const url = new URL(origin);
      const isLocalVite = url.hostname === "localhost" && /^517\d$/.test(url.port);
      if (isLocalVite || allowed.has(origin)) return cb(null, true);
    } catch {
      // ignore
    }
    return cb(new Error("Not allowed by CORS"));
  };
}

const corsOrigin = buildCorsOrigin();

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});
initSocket(io);

io.on("connection", (socket) => {
  // Client should emit: { userId } after login to join their room
  socket.on("join", ({ userId }) => {
    if (userId) socket.join(String(userId));
  });
});

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
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

app.get("/api/health", (req, res) => res.json({ success: true, data: { ok: true }, message: "OK", error: "" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    //initCloudinary();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
