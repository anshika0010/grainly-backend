import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ✅ Get cart by sessionId
export const getCart = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    let cart = await Cart.findOne({ sessionId });

    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = await Cart.create({
        sessionId,
        items: [],
        totalItems: 0,
        subtotal: 0,
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// ✅ Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    console.log("Add to cart request:", { sessionId, productId, quantity });

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product found:", product.itemName);

    // Find or create cart
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({
        sessionId,
        items: [],
      });
      console.log("Created new cart for session:", sessionId);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity (max 99)
      cart.items[existingItemIndex].quantity = Math.min(
        99,
        cart.items[existingItemIndex].quantity + quantity
      );
      console.log("Updated existing item quantity");
    } else {
      // Add new item
      const newItem = {
        productId: product._id,
        name: product.itemName,
        flavour: product.flavour || product.itemName,
        price: product.discountedPrice,
        image:
          product.images && product.images.length > 0 ? product.images[0] : "",
        quantity: Math.max(1, Math.min(99, quantity)),
      };
      cart.items.push(newItem);
      console.log("Added new item to cart:", newItem);
    }

    const savedCart = await cart.save();
    console.log("Cart saved successfully");

    res.status(200).json({
      message: "Item added to cart",
      cart: savedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error adding to cart",
      error: error.message,
      details: error.toString(),
    });
  }
};

// ✅ Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    if (quantity === undefined || quantity < 1 || quantity > 99) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update quantity
    cart.items[itemIndex].quantity = Math.max(1, Math.min(99, quantity));
    await cart.save();

    res.status(200).json({
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

// ✅ Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { sessionId, productId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the item
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res
      .status(500)
      .json({ message: "Error removing from cart", error: error.message });
  }
};

// ✅ Clear cart
export const clearCart = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

// ✅ Sync cart from frontend (useful for migrating localStorage cart to backend)
export const syncCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { items } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = await Cart.create({
        sessionId,
        items: [],
      });
    }

    // Validate and format items
    const validItems = [];
    for (const item of items) {
      const product = await Product.findById(item.id || item.productId);
      if (product) {
        validItems.push({
          productId: product._id,
          name: item.name || product.itemName,
          flavour: item.flavour || product.flavour || product.itemName,
          price: item.price || product.discountedPrice,
          image: item.image || product.images[0] || "",
          quantity: Math.max(1, Math.min(99, item.quantity || 1)),
        });
      }
    }

    cart.items = validItems;
    await cart.save();

    res.status(200).json({
      message: "Cart synced successfully",
      cart,
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res
      .status(500)
      .json({ message: "Error syncing cart", error: error.message });
  }
};
