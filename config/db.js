import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Disconnect any existing connections first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Force local MongoDB connection
    const mongoUri = "mongodb://localhost:27017/grainly";

    console.log("🔗 Connecting to local MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected: localhost:27017/grainly");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("💡 Make sure MongoDB is running locally on port 27017");
    console.log("💡 Start MongoDB with: net start MongoDB");
    console.log("💡 Or install MongoDB Community Edition");
    process.exit(1);
  }
};
