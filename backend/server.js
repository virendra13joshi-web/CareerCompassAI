require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const { initializeDatabase } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { checkUpcomingDeadlines } = require("./services/notificationService");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================================================
   TRUST PROXY
   Required for Render / reverse proxy
========================================================= */

app.set("trust proxy", 1);

/* =========================================================
   SECURITY
========================================================= */

app.use(helmet());

app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

/* =========================================================
   COMPRESSION
========================================================= */

app.use(compression());

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://careercompassai-frontend.onrender.com",
];

// Also allow origins provided through Render environment variable
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    });
}

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

/* =========================================================
   RATE LIMITING
========================================================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================================================
   ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/eligibility", eligibilityRoutes);

app.use("/api/resume", resumeRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/experiences", experienceRoutes);

app.use("/api/roadmap", roadmapRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/admin", adminRoutes);

/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to CareerCompass AI API",
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);

/* =========================================================
   DATABASE + SERVER
========================================================= */

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);

      // Run deadline checker on startup
      checkUpcomingDeadlines();

      // Run every 12 hours
      setInterval(
        checkUpcomingDeadlines,
        12 * 60 * 60 * 1000
      );
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });