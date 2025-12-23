import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";

const router = express.Router();

// ✅ Get cart by sessionId
router.get("/:sessionId", getCart);

// ✅ Add item to cart
router.post("/:sessionId/add", addToCart);

// ✅ Update cart item quantity
router.put("/:sessionId/update/:productId", updateCartItem);

// ✅ Remove item from cart
router.delete("/:sessionId/remove/:productId", removeFromCart);

// ✅ Clear entire cart
router.delete("/:sessionId/clear", clearCart);

// ✅ Sync cart from frontend (for migrating localStorage to backend)
router.post("/:sessionId/sync", syncCart);

export default router;
