require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Databaser
connectDB();

// Static folders
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/complaints", require("./src/routes/complaintRoutes"));
app.use("/api/fixes", require("./src/routes/fixReportRoutes"));
app.use("/api/feed", require("./src/routes/feedRoutes"));
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
