const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Complaint = require("./src/models/Complaint");
const User = require("./src/models/User");
const FixReport = require("./src/models/FixReport");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB for seeding...");

    // 1. Find or create a dummy user
    let user = await User.findOne({ email: "citizen@example.com" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    if (!user) {
      user = await User.create({
        name: "Jai Sharma",
        email: "citizen@example.com",
        password: hashedPassword,
        role: "User",
      });
    } else {
      // Update password in case it was plain text before
      user.password = hashedPassword;
      await user.save();
    }

    // Create or update an admin user
    let admin = await User.findOne({ email: "admin@example.com" });

    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "Admin",
      });
    } else {
      // Update admin user password and ensure role is Admin
      admin.password = hashedPassword;
      admin.role = "Admin";
      await admin.save();
    }

    // Clear existing demo data
    await Complaint.deleteMany({ description: /Demo/ });
    await FixReport.deleteMany({ description: /Demo/ });

    // 2. Create a "Pending" Complaint
    const pending = await Complaint.create({
      userId: user._id,
      description: "[Demo] Large pothole near Central Park entrance.",
      userImageURL:
        "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      location: { lat: 28.6139, lng: 77.209 },
      status: "Pending",
      upvotes: [user._id],
    });

    // 3. Create a "Resolved" Complaint + Linked Fix Report
    const resolved = await Complaint.create({
      userId: user._id,
      description: "[Demo] Broken street light at Sector 4 junction.",
      userImageURL:
        "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      location: { lat: 28.5355, lng: 77.391 },
      status: "Resolved",
    });

    const fix = await FixReport.create({
      departmentId: new mongoose.Types.ObjectId(), // Dummy ID
      municipalityId: new mongoose.Types.ObjectId(), // Dummy ID
      relatedComplaintId: resolved._id,
      description: "[Demo Official] Replaced LED bulb and fixed wiring.",
      fixImageURL: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      location: { lat: 28.5355, lng: 77.391 },
    });

    resolved.relatedFixPost = fix._id;
    await resolved.save();

    console.log(
      "Database Seeded Successfully! 1 Pending, 1 Resolved with Fix.",
    );
    console.log("User Login: citizen@example.com / password123");
    console.log("Admin Login: admin@example.com / password123");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
