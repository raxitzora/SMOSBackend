import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import platformRoutes from "./routes/platforms.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

// Security
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Compress responses
app.use(compression());

// Parse Cookies
app.use(cookieParser());

// Parse JSON
app.use(express.json());

// Parse Form Data
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SMOS Backend is running 🚀",
  });
});

export default app;