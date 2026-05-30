// scripts/seedAdmin.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  schoolId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isApproved: Boolean,
}, { timestamps: true });

const User = (mongoose.models.User ||
  mongoose.model("User", UserSchema)) as mongoose.Model<any>;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    const existing = await User.findOne({ role: "master-admin" });
    if (existing) {
      console.log("Master admin already exists:", existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    await User.create({
      name: "Master Admin",
      email: "admin@educonnect.com",
      password: hashedPassword,
      role: "master-admin",
      schoolId: null,
      isApproved: true,  // master admin pre-approved hoga
    });

    console.log("Master admin created!");
    console.log("Email   : admin@educonnect.com");
    console.log("Password: Admin@123");
    console.log("Change this password after first login!");
    process.exit(0);

  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedAdmin();