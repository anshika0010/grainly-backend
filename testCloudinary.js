// Test Cloudinary Configuration
import cloudinary from "./config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Testing Cloudinary Configuration...\n");

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

console.log("\n🔧 Cloudinary Config:");
console.log(
  "Cloud Name:",
  cloudinary.config().cloud_name || "❌ NOT CONFIGURED"
);
console.log("API Key:", cloudinary.config().api_key || "❌ NOT CONFIGURED");
console.log(
  "API Secret:",
  cloudinary.config().api_secret ? "✅ CONFIGURED" : "❌ NOT CONFIGURED"
);

// Test Cloudinary connection
async function testCloudinary() {
  try {
    console.log("\n🚀 Testing Cloudinary Connection...");

    // Test with a simple image URL
    const testResult = await cloudinary.uploader.upload(
      "https://via.placeholder.com/100x100/ff6b6b/ffffff?text=Test",
      {
        folder: "grainly-test",
        public_id: "test-image-" + Date.now(),
      }
    );

    console.log("✅ Cloudinary Connection Successful!");
    console.log("📸 Test Image URL:", testResult.secure_url);

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
    }
  }
}

// Run test
testCloudinary();
