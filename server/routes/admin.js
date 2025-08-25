import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Chat from "../models/Chat.js";
import Plan from "../models/Plan.js";
import { adminProtect } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
      isActive: true,
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role, type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Admin Dashboard Stats
router.get("/dashboard", adminProtect, async (req, res) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      pendingTransactions,
      totalInvestments,
      openChats,
      activePlans,
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: "pending" }),
      Transaction.aggregate([
        { $match: { type: "investment", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Chat.countDocuments({ status: "open" }),
      Plan.countDocuments({ isActive: true }),
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email createdAt isVerified");

    const recentTransactions = await Transaction.find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalTransactions,
          pendingTransactions,
          totalInvestments: totalInvestments[0]?.total || 0,
          openChats,
          activePlans,
        },
        recentUsers,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Management Routes
router.get("/users", adminProtect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.isVerified = status === "verified";
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-password");

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/:id", adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userTransactions = await Transaction.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    const userChats = await Chat.find({ userId: user._id }).sort({
      lastMessageAt: -1,
    });

    res.json({
      success: true,
      data: {
        user,
        transactions: userTransactions,
        chats: userChats,
      },
    });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/users/:id", adminProtect, async (req, res) => {
  try {
    const { fullName, email, isVerified, balance } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, isVerified, balance },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("User update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/users/:id", adminProtect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clean up related data
    await Transaction.deleteMany({ userId: user._id });
    await Chat.deleteMany({ userId: user._id });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Transaction Management Routes
router.get("/transactions", adminProtect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, userId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.userId = userId;

    const transactions = await Transaction.find(query)
      .populate("userId", "fullName email")
      .populate("processedBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error("Transactions fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/transactions/:id", adminProtect, async (req, res) => {
  try {
    const { status, adminNotes, txHash } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        txHash,
        processedBy: req.admin.id,
        processedAt: new Date(),
      },
      { new: true }
    ).populate("userId", "fullName email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Transaction update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update transaction status only
router.patch("/transactions/:id/status", adminProtect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status,
        processedBy: req.admin.id,
        processedAt: new Date(),
      },
      { new: true }
    ).populate("userId", "fullName email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // If transaction is confirmed (deposit or withdrawal), recalculate user's balance and totalWithdraws atomically
    if (status === "confirmed") {
      const userId = transaction.userId._id;

      // Aggregate totals for confirmed deposits and confirmed withdrawals for this user
      const [confirmedDeposits, confirmedWithdrawals] = await Promise.all([
        Transaction.aggregate([
          { $match: { userId: userId, type: "deposit", status: "confirmed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transaction.aggregate([
          {
            $match: { userId: userId, type: "withdrawal", status: "confirmed" },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      const depositTotal = confirmedDeposits[0]?.total || 0;
      const withdrawalTotal = confirmedWithdrawals[0]?.total || 0;
      const newBalance = depositTotal - withdrawalTotal;

      // Update user with recalculated balance and totalWithdraws (idempotent)
      await User.findByIdAndUpdate(userId, {
        balance: newBalance,
        totalWithdraws: withdrawalTotal,
      });

      console.log(
        `Recalculated user ${userId} balance ${newBalance} and totalWithdraws ${withdrawalTotal} after confirming transaction ${transaction._id}`
      );
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Transaction status update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Plan Management Routes
router.get("/plans", adminProtect, async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Plans fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/plans", adminProtect, async (req, res) => {
  try {
    const planData = { ...req.body, createdBy: req.admin.id };
    const plan = new Plan(planData);
    await plan.save();

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Plan create error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/plans/:id", adminProtect, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Plan update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/plans/:id", adminProtect, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Plan delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Chat Management Routes
router.get("/chats", adminProtect, async (req, res) => {
  try {
    const { status = "open", page = 1, limit = 10 } = req.query;
    const query = status === "all" ? {} : { status };

    const chats = await Chat.find(query)
      .populate("userId", "fullName email")
      .populate("adminId", "username")
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Chat.countDocuments(query);

    res.json({
      success: true,
      data: {
        chats,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error("Chats fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/chats/:id", adminProtect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("adminId", "username")
      .populate("messages.senderId", "fullName username");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark all user messages as read when admin opens the chat
    let hasUnreadMessages = false;
    chat.messages.forEach((msg) => {
      if (msg.senderModel === "User" && !msg.isRead) {
        msg.isRead = true;
        hasUnreadMessages = true;
      }
    });

    if (hasUnreadMessages) {
      await chat.save();
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("Chat fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/chats/:id/messages", adminProtect, async (req, res) => {
  try {
    const { message } = req.body;

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages.push({
      senderId: req.admin.id,
      senderModel: "Admin",
      message,
    });

    chat.adminId = req.admin.id;
    chat.lastMessageAt = new Date();

    await chat.save();

    const updatedChat = await Chat.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("adminId", "username")
      .populate("messages.senderId", "fullName username");

    res.json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    console.error("Chat message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/chats/:id", adminProtect, async (req, res) => {
  try {
    const { status, priority, adminId } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { status, priority, adminId },
      { new: true }
    )
      .populate("userId", "fullName email")
      .populate("adminId", "username");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("Chat update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
