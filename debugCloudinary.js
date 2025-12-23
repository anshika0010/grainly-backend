// Debug Cloudinary Configuration
import cloudinary from "./config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Debugging Cloudinary Configuration...\n");

// Check if .env file exists and is loaded
console.log("📋 Environment Check:");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("PORT:", process.env.PORT || "5000");

// Check Cloudinary environment variables
console.log("\n🔧 Cloudinary Environment Variables:");
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
  process.env.CLOUDINARY_API_SECRET ? "✅ SET (hidden)" : "❌ NOT SET"
);

// Check Cloudinary configuration
console.log("\n⚙️ Cloudinary Configuration:");
try {
  const config = cloudinary.config();
  console.log("Cloud Name:", config.cloud_name || "❌ NOT CONFIGURED");
  console.log("API Key:", config.api_key || "❌ NOT CONFIGURED");
  console.log(
    "API Secret:",
    config.api_secret ? "✅ CONFIGURED" : "❌ NOT CONFIGURED"
  );
} catch (error) {
  console.error("❌ Error accessing Cloudinary config:", error.message);
}

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log("\n🚀 Testing Cloudinary Connection...");

    // Check if credentials are available
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.log(
        "❌ Cloudinary credentials not found in environment variables"
      );
      console.log("\n💡 Solution:");
      console.log("1. Create .env file in grainlyBE folder");
      console.log("2. Add your Cloudinary credentials:");
      console.log("   CLOUDINARY_CLOUD_NAME=your_cloud_name");
      console.log("   CLOUDINARY_API_KEY=your_api_key");
      console.log("   CLOUDINARY_API_SECRET=your_api_secret");
      return;
    }

    // Test upload with a simple image
    const testResult = await cloudinary.uploader.upload(
      "https://via.placeholder.com/100x100/ff6b6b/ffffff?text=Test",
      {
        folder: "grainly-debug",
        public_id: "debug-test-" + Date.now(),
      }
    );

    console.log("✅ Cloudinary Connection Successful!");
    console.log("📸 Test Image URL:", testResult.secure_url);
    console.log("📁 Public ID:", testResult.public_id);

    // Clean up test image
    await cloudinary.uploader.destroy(testResult.public_id);
    console.log("🧹 Test image cleaned up");
  } catch (error) {
    console.error("❌ Cloudinary Connection Failed:");
    console.error("Error:", error.message);

    if (error.message.includes("Invalid cloud_name")) {
      console.log(
        "\n💡 Solution: Check your CLOUDINARY_CLOUD_NAME in .env file"
      );
    } else if (error.message.includes("Invalid API key")) {
      console.log("\n💡 Solution: Check your CLOUDINARY_API_KEY in .env file");
    } else if (error.message.includes("Invalid API secret")) {
      console.log(
        "\n💡 Solution: Check your CLOUDINARY_API_SECRET in .env file"
      );
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 Solution: Check your internet connection");
    }
  }
}

// Run the test
testCloudinaryConnection();
