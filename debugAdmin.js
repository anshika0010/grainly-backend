import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

async function debugAdmin() {
  try {
    await connectDB();

    // Find admin user
    const admin = await Admin.findOne({ username: "admin" });
    
    if (!admin) {
      console.log("❌ Admin user not found");
      return;
    }

    console.log("✅ Admin user found:");
    console.log("Username:", admin.username);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Active:", admin.active);
    console.log("Password hash:", admin.password);
    
    // Test password verification
    const testPassword = "admin123";
    const isValid = admin.verifyPassword(testPassword);
    console.log("Password 'admin123' is valid:", isValid);
    
    // Test token generation
    const token = admin._id.toString();
    console.log("Generated token:", token);

    process.exit(0);
  } catch (error) {
    console.error("Error debugging admin:", error);
    process.exit(1);
  }
}

debugAdmin();
