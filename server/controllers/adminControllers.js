import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { hashPassword } from "../utils/hash.js";
import jwt from "jsonwebtoken";

// FIXED ADMIN CREDENTIALS
const ADMIN_EMAIL = "varadmule17@gmail.com";
const ADMIN_PASSWORD = "P@ssword17"; 

// ==================== ADMIN AUTH ====================

export const adminSignIn = async (req, res) => {
  console.log("Admin signin route called");
  const { email, password } = req.body;

  try {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      const hashedPassword = await hashPassword(ADMIN_PASSWORD, 12);
      adminUser = new User({
        username: "admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        isAdmin: true,
        verified: true,
      });
      await adminUser.save();
      console.log("Admin created...");
    }

    const token = jwt.sign(
      {
        userId: adminUser._id,
        email: adminUser.email,
        username: adminUser.username,
        verified: true,
        isAdmin: true,
      },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: "8h" }
    );

    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({
        success: true,
        message: "Admin sign in successful.",
        token,
      });
  } catch (error) {
    console.error("[Admin Signin] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("[Get All Users] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const makeAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.isAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "User is already an admin." });
    }

    user.isAdmin = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.username} is now an admin.`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("[Make Admin] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const removeAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!user.isAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "User is not an admin." });
    }

    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin rights.",
      });
    }

    user.isAdmin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.username} is no longer an admin.`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("[Remove Admin] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[Delete User] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("[Toggle User Status] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==================== PRODUCTS CRUD ====================

export const getAllProducts = async (req, res) => {
  try {
    const { search, category, addedBy } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All Categories") query.categories = category;
    if (addedBy) query.addedBy = addedBy;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products, count: products.length });
  } catch (error) {
    console.error("[Get All Products] Server error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("[Get Product By Id] Server error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { title, desc, img, categories, size, color, price, stock, status } =
      req.body;

    const existingProduct = await Product.findOne({ title });
    if (existingProduct)
      return res.status(400).json({
        success: false,
        message: "Product with this title already exists",
      });

    const newProduct = new Product({
      title,
      desc,
      img,
      categories,
      size,
      color,
      price: price.toString(),
      stock: parseInt(stock) || 10,
      status: status || "active",
      addedBy: "admin",
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("[Add Product] Server error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.stock) updates.stock = parseInt(updates.stock);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedProduct)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("[Update Product] Server error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("[Delete Product] Server error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ORDERS ====================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "username email")
      .populate("products.productId", "title img price")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders, count: orders.length });
  } catch (error) {
    console.error("[Get All Orders] Server error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updatedOrder)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[Update Order Status] Server error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
