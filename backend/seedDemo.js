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

    // Clear existing demo data (This will wipe those ugly cards from your DB!)
    await Complaint.deleteMany({ description: /Demo/ });
    await FixReport.deleteMany({ description: /Demo/ });
    await Municipality.deleteMany({}); // Clear to start fresh

    // 1.5 Seed City & Municipalities
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

    for (const m of goaMunicipalities) {
      await Municipality.findOneAndUpdate(
        { name: m.name },
        { name: m.name, cityId: m.cityId },
        { upsert: true, new: true }
      );
    }

    console.log(`Database Seeded Successfully! Users and Municipalities are ready. Demo complaints removed.`);
    console.log("User Login: citizen@example.com / password123");
    console.log("Admin Login: admin@example.com / password123");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();