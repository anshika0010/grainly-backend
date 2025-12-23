import mongoose from "mongoose";
import crypto from "crypto";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "editor"],
      default: "admin",
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Simple hash function (in production, use bcrypt)
adminSchema.methods.hashPassword = function (password) {
  return crypto.createHash("sha256").update(password).digest("hex");
};

adminSchema.methods.verifyPassword = function (password) {
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  return hash === this.password;
};

// Hash password before saving
adminSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = this.hashPassword(this.password);
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;


