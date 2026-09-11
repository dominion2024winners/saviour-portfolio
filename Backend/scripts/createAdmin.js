const dns = require("dns");

// Fix MongoDB Atlas SRV DNS resolution
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    const email = "ambcolesaint@gmail.com";
    const password = "Mhiztaricocole090#";

    const existingAdmin = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    await User.create({
      name: "Portfolio Admin",
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:");
    console.error(error);

    process.exit(1);
  }
};

createAdmin();