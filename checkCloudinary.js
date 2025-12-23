// Simple Cloudinary Check
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Checking Cloudinary Configuration...\n");

// Check environment variables
console.log("📋 Environment Variables:");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME || "❌ NOT SET"
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY || "❌ NOT SET"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ NOT SET"
);

// Check if .env file exists
console.log("\n📁 File Check:");
try {
  const fs = await import("fs");
  if (fs.existsSync(".env")) {
    console.log("✅ .env file exists");
  } else {
    console.log("❌ .env file does not exist");
    console.log("\n💡 Solution:");
    console.log("1. Create .env file in grainlyBE folder");
    console.log("2. Add your Cloudinary credentials:");
    console.log("   CLOUDINARY_CLOUD_NAME=your_cloud_name");
    console.log("   CLOUDINARY_API_KEY=your_api_key");
    console.log("   CLOUDINARY_API_SECRET=your_api_secret");
  }
} catch (error) {
  console.log("❌ Error checking .env file:", error.message);
}

console.log("\n🎯 Next Steps:");
console.log("1. Create Cloudinary account at cloudinary.com");
console.log("2. Get your credentials from dashboard");
console.log("3. Create .env file with your credentials");
console.log("4. Run: node debugCloudinary.js");
console.log("5. Start backend: npm start");
