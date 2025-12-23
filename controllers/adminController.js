import Admin from "../models/Admin.js";

// ✅ Admin login
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    if (!admin.verifyPassword(password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if active
    if (!admin.active) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Return admin data (in production, return JWT token)
    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token: admin._id.toString(), // Simple token (use JWT in production)
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Error during login", error: error.message });
  }
};

// ✅ Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin;

    res.status(200).json({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      lastLogin: admin.lastLogin,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// ✅ Create admin (only super-admin)
export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    // Check if admin already exists
    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      username,
      email,
      password,
      name,
      role: role || "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
};

// ✅ Get all admins (super-admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Error fetching admins", error: error.message });
  }
};

// ✅ Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password update through this route
    delete updates.password;

    const admin = await Admin.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
};

// ✅ Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.admin._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
};

// ✅ Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const Product = (await import("../models/Product.js")).default;
    const Order = (await import("../models/Order.js")).default;
    const Cart = (await import("../models/Cart.js")).default;
    const Blog = (await import("../models/Blog.js")).default;

    const [productsCount, ordersCount, cartsCount, blogsCount, recentOrders] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Cart.countDocuments(),
        Blog.countDocuments(),
        Order.find().sort({ createdAt: -1 }).limit(5),
      ]);

    // Calculate total revenue
    const orders = await Order.find({ paymentStatus: { $ne: "failed" } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Pending orders
    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });

    res.status(200).json({
      stats: {
        products: productsCount,
        orders: ordersCount,
        carts: cartsCount,
        blogs: blogsCount,
        revenue: totalRevenue,
        pendingOrders,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};


