import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

async function seedAdmin() {
  try {
    await connectDB();

    const existing = await Admin.findOne({ username: "admin" });
    if (existing) {
      console.log("⚠️  Admin user already exists");
      console.log("Username: admin");
      console.log(
        "If you forgot the password, delete the admin and run this script again."
      );
      process.exit(0);
    }

    const admin = await Admin.create({
      username: "admin",
      email: "admin@grainly.com",
      password: "admin123",
      name: "Admin User",
      role: "super-admin",
    });

    console.log("✅ Default admin created successfully!");
    console.log("───────────────────────────────────");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Email:    admin@grainly.com");
    console.log("Role:     super-admin");
    console.log("───────────────────────────────────");
    console.log("⚠️  IMPORTANT: Change the password after first login!");
    console.log("Backend API: http://localhost:5000");
    console.log("Admin Panel: http://localhost:3002");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
