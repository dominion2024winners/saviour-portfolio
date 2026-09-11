const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");

// ============================================================
// ENVIRONMENT CONFIGURATION
// ============================================================

dotenv.config();

// ============================================================
// MONGODB ATLAS DNS FIX
// ============================================================

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();

app.locals.websiteEnabled = true;

const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const blogRoutes = require("./routes/blogRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const PORT = process.env.PORT || 5000;

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ============================================================
// BODY PARSING
// ============================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const adminRequest =
    req.path.startsWith("/api/auth") ||
    req.path.startsWith("/api/settings/site-status") ||
    Boolean(req.headers.authorization);

  if (
    !app.locals.websiteEnabled &&
    !adminRequest &&
    req.path.startsWith("/api/")
  ) {
    return res.status(503).json({
      success: false,
      message: "Website is temporarily disabled. Please check back soon.",
      websiteEnabled: false,
    });
  }

  next();
});

// ============================================================
// API ROUTES
// ============================================================

// Authentication
app.use("/api/auth", authRoutes);

// Projects
app.use("/api/projects", projectRoutes);

app.use("/api/inquiries", inquiryRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/settings", settingsRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/blog", blogRoutes);

app.use("/api/analytics", analyticsRoutes);
app.use("/api/newsletter", newsletterRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio API is running",
  });
});

// ============================================================
// API HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio backend is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ============================================================
// MONGODB CONNECTION
// ============================================================

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in the .env file"
      );
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    console.warn(
      "Continuing in offline mode. The app will still start without a database connection."
    );
    return false;
  }
};

// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {
  try {
    const dbConnected = await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Local API: http://localhost:${PORT}`);
      console.log(
        `Database status: ${dbConnected ? "connected" : "offline mode"}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:");
    console.error(error.message);

    process.exit(1);
  }
};

// ============================================================
// START APPLICATION
// ============================================================

startServer();

// ============================================================
// HANDLE UNEXPECTED ERRORS
// ============================================================

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:");
  console.error(error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:");
  console.error(error);
});