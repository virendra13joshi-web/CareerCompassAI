require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
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
const { checkUpcomingDeadlines } = require("./services/notificationService");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// Middleware
// Security Headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to be served to frontend

// Compression
app.use(compression());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
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

// Basic Route
app.get("/", (req, res) => {
  res.send("Welcome to CareerCompass AI API");
});

// Global Error Handler (must be after routes)
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Initialize DB and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Run deadline checker on startup, then every 12 hours
    checkUpcomingDeadlines();
    setInterval(checkUpcomingDeadlines, 12 * 60 * 60 * 1000);
  });
});
