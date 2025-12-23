import express from "express";
import {
  createOrder,
  getOrder,
  getOrdersBySession,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// ✅ Create new order
router.post("/create", createOrder);

// ✅ Get order by ID or order number
router.get("/:id", getOrder);

// ✅ Get all orders for a session
router.get("/session/:sessionId", getOrdersBySession);

// ✅ Get all orders (admin)
router.get("/", getAllOrders);

// ✅ Update order status
router.put("/:id/status", updateOrderStatus);

// ✅ Cancel order
router.put("/:id/cancel", cancelOrder);

export default router;

