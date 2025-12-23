import express from "express";
import {
  adminLogin,
  getAdminProfile,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  getDashboardStats,
} from "../controllers/adminController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public routes
router.post("/login", adminLogin);

// ✅ Protected routes (require authentication)
router.use(authMiddleware); // All routes below require authentication

router.get("/profile", getAdminProfile);
router.get("/dashboard/stats", getDashboardStats);

// ✅ Super admin only routes
router.post("/create", requireRole(["super-admin"]), createAdmin);
router.get("/all", requireRole(["super-admin"]), getAllAdmins);
router.put("/:id", requireRole(["super-admin"]), updateAdmin);
router.delete("/:id", requireRole(["super-admin"]), deleteAdmin);

export default router;


