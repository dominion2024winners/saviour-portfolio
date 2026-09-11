const dns = require("dns");

// ============================================================
// MONGODB ATLAS DNS FIX
// ============================================================

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config();

// ============================================================
// ADMIN DETAILS
// CHANGE THESE VALUES
// ============================================================

const ADMIN_NAME = "Saviour Salvador";
const ADMIN_EMAIL = "ambcolesaint@gmail.com";
const ADMIN_PASSWORD = "Mhiztaricocole090#";

// ============================================================
// RESET / CREATE ADMIN
// ============================================================

const resetAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    const email = ADMIN_EMAIL.toLowerCase().trim();

    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

    let admin = await Admin.findOne({ email });

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = hashedPassword;
      admin.role = "admin";

      await admin.save();

      console.log("Admin account updated successfully.");
    } else {
      admin = await Admin.create({
        name: ADMIN_NAME,
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin account created successfully.");
    }

    console.log("----------------------------------------");
    console.log("Admin email:", email);
    console.log("Admin password:", ADMIN_PASSWORD);
    console.log("----------------------------------------");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("Failed to reset admin:");
    console.error(error);

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
};

resetAdmin();