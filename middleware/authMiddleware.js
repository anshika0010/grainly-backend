import Admin from "../models/Admin.js";

// Simple session-based auth middleware
export const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in headers (case insensitive)
    const adminToken = req.headers.admintoken || req.headers.adminToken || req.headers.authorization;

    if (!adminToken) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // In a simple implementation, token is just the admin ID
    // In production, use JWT tokens
    const admin = await Admin.findById(adminToken);

    if (!admin || !admin.active) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Check if admin has specific role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
    }

    next();
  };
};


