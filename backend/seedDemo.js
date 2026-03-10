const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Complaint = require("./src/models/Complaint");
const User = require("./src/models/User");
const FixReport = require("./src/models/FixReport");
const City = require("./src/models/City");
const Municipality = require("./src/models/Municipality");
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
    await Municipality.deleteMany({}); // Clear to start fresh with Goa

    // 1.5 Seed Goa City & Municipalities
    let goa = await City.findOne({ name: "Goa" });
    if (!goa) {
      goa = await City.create({ name: "Goa" });
    }

    const goaMunicipalities = [
      { name: "Panaji Municipal Corporation", cityId: goa._id },
      { name: "Margao Municipal Council", cityId: goa._id },
      { name: "Mormugao Municipal Council", cityId: goa._id },
      { name: "Mapusa Municipal Council", cityId: goa._id },
      { name: "Ponda Municipal Council", cityId: goa._id }
    ];

    const createdMunicipalities = [];
    for (const m of goaMunicipalities) {
      const muni = await Municipality.findOneAndUpdate(
        { name: m.name },
        { name: m.name, cityId: m.cityId },
        { upsert: true, new: true }
      );
      createdMunicipalities.push(muni);
    }

    // 2. Create a "Pending" Complaint
    const pending = await Complaint.create({
      userId: user._id,
      description: "[Demo] Street lights not working in Miramar.",
      userImageURL: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      location: { lat: 15.485, lng: 73.812 }, // Panaji area
      status: "Pending",
      cityId: goa._id,
      municipalityId: createdMunicipalities[0]._id, // Panaji
      upvotes: [user._id],
    });

    // 3. Create a "Resolved" Complaint + Linked Fix Report
    const resolved = await Complaint.create({
      userId: user._id,
      description: "[Demo] Water pipe burst near Margao Market.",
      userImageURL: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      location: { lat: 15.273, lng: 73.957 }, // Margao area
      status: "Resolved",
      cityId: goa._id,
      municipalityId: createdMunicipalities[1]._id, // Margao
    });

    const fix = await FixReport.create({
      municipalityId: createdMunicipalities[1]._id, // Margao
      relatedComplaintId: resolved._id,
      description: "[Demo Official] Pipe replaced and pressure restored.",
      fixImageURL: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      location: { lat: 15.273, lng: 73.957 },
    });

    resolved.relatedFixPost = fix._id;
    resolved.municipalityId = createdMunicipalities[1]._id;
    await resolved.save();

    console.log(`Database Seeded Successfully! 5 Goa Municipalities, 1 Pending, 1 Resolved.`);
    console.log("User Login: citizen@example.com / password123");
    console.log("Admin Login: admin@example.com / password123");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
