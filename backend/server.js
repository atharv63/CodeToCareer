require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const adminRoutes = require("./src/routes/adminRoutes");
const Municipality = require("./src/models/Municipality");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
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

// Mount the Staff Routes
app.use("/api/staff", require("./src/routes/staffRoutes"));

// Public route to fetch municipalities for the register dropdown
app.get("/api/public/municipalities", async (req, res) => {
    try {
        const munis = await Municipality.find({});
        res.json(munis);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});