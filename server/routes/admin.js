import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Chat from "../models/Chat.js";
import Plan from "../models/Plan.js";
import { adminProtect } from "../middleware/adminAuth.js";
import sendEmail, { emailTemplates } from "../utils/email.js";

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

    // Validate status is in allowed enum values
    const allowedStatuses = [
      "pending",
      "confirmed",
      "completed",
      "failed",
      "cancelled",
      "active",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        allowedStatuses: allowedStatuses,
      });
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

      // Aggregate totals for confirmed deposits and confirmed/completed withdrawals for this user
      const [confirmedDeposits, confirmedWithdrawals] = await Promise.all([
        Transaction.aggregate([
          { $match: { userId: userId, type: "deposit", status: "confirmed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              userId: userId,
              type: "withdrawal",
              status: { $in: ["confirmed", "completed"] },
            },
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

    // Send email notification for status updates
    try {
      let emailDetails = "";
      if (status === "confirmed") {
        if (transaction.type === "deposit") {
          emailDetails =
            "Your deposit has been verified and confirmed. The amount has been added to your balance.";
        } else if (transaction.type === "withdrawal") {
          emailDetails = "Your withdrawal has been approved and processed.";
        }
      } else if (status === "failed") {
        emailDetails =
          "Unfortunately, your transaction could not be processed. Please contact support for assistance.";
      } else if (status === "cancelled") {
        emailDetails = "Your transaction has been cancelled as requested.";
      }

      if (emailDetails) {
        const email = emailTemplates.transactionUpdate(
          transaction.userId.fullName,
          transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
          transaction.amount,
          status,
          emailDetails
        );
        await sendEmail({
          email: transaction.userId.email,
          subject: email.subject,
          message: email.message,
          html: email.html,
        });
      }
    } catch (emailError) {
      console.error("Error sending transaction status email:", emailError);
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

// Test route to check if admin routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are working", timestamp: new Date() });
});

// Test ping route without authentication for debugging
router.post("/test/ping/:id", async (req, res) => {
  try {
    console.log("Test ping endpoint hit - User ID:", req.params.id);
    console.log("Test ping request body:", req.body);

    const { message } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        pingNotification: {
          isActive: true,
          message: message || "TEST MESSAGE",
          createdAt: new Date(),
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Test ping notification sent successfully to:", user.fullName);
    res.json({
      success: true,
      message: `Test ping notification sent to ${user.fullName}`,
      data: {
        user: user.fullName,
        notification: user.pingNotification,
      },
    });
  } catch (error) {
    console.error("Test ping user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get available ping messages
router.get("/ping-messages", adminProtect, async (req, res) => {
  try {
    const validMessages = [
      "UPGRADE YOUR ACCOUNT TO BASIC PLAN TO ACTIVATE VOUCHER OF $2000",
      "UPGRADE YOUR ACCOUNT TO PROFESSIONAL TO ACTIVATE VOUCHER OF $5500",
      "GET UP TO $3500 IN BONUS CREDIT BY ADDING $550 FOR ACTIVATION",
      "CONGRATULATIONS YOU ARE ALMOST AT THE VIP PLAN UPGRADE YOUR ACCOUNT TO CLAIM VOUCHER OF $30000",
      "A MINING BONUS OF $90624 HAVE BEEN ADDED TO YOUR ACCOUNT CONTACT THE SUPPORT FOR GUIDANCE ON HOW TO CLAIM IT",
      // New promotional messages
      "Congratulations 🎊 You just won $5,420 profit, kindly deposit $1,014 to activate your Professional Plan.",
      "Bravo 👏 You've been awarded $2,054 profit, activation requires only $460 to proceed.",
      "Well done 🎉 Your profit prize of $3,760 is ready! Kindly activate with $740.",
      "Amazing 👑 You secured $6,820 profit, kindly deposit $1,360 to activate it.",
      "Congratulations 🌟 You won $4,250 profit, activate now with just $850.",
      "Cheers 🎊 Your $7,940 profit is waiting, kindly activate with $1,590.",
      "Wonderful 👏 You earned $3,360 profit, activation deposit required is $670.",
      "Congratulations 🎉 Your prize of $8,250 profit is available, deposit $1,650 to activate.",
      "Fantastic 🌟 You've won $5,910 profit, kindly deposit $1,190 to activate it.",
      "Bravo 🎊 You're awarded $2,980 profit, activation requires only $600.",
      "Cheers 👏 Your $6,480 profit is credited, activate it now with $1,300.",
      "Congratulations 🎉 You just secured $4,670 profit, activation deposit: $930.",
      "Great job 👑 You've unlocked $7,520 profit, kindly activate with $1,510.",
      "Fantastic 🌟 Your profit prize is $3,480, kindly deposit $700 to activate.",
      "Well done 🎊 You're rewarded with $9,240 profit, kindly deposit $1,850 for activation.",
      "Congratulations 👏 You just earned $5,350 profit, activation deposit: $1,070.",
      "Cheers 🎉 Your prize of $2,750 profit is here, activate with $550 only.",
      "Bravo 🌟 You won $8,640 profit, kindly deposit $1,720 to activate.",
      "Wonderful 🎊 Your profit reward is $4,820, activation requires $960.",
      "Congratulations 👑 You just secured $6,990 profit, deposit $1,420 to activate it.",
      // Premium profit messages
      "🎉 Congratulations dear! You've just won $10,000 profit 🎊 Kindly deposit $2,000 to activate your plan.",
      "👑 Bravo! Your account has been credited with $15,800 profit 🌟 Activate now with just $3,200.",
      "🎊 Cheers! You've unlocked $21,600 profit 👏 Please deposit $4,320 to proceed.",
      "🌟 Wonderful news! Your profit prize of $28,500 is ready 🎉 Kindly activate with $5,700.",
      "🎉 Congratulations! You've earned $33,200 profit 👑 Deposit $6,600 to activate your professional plan.",
      "👏 Great job! Your balance shows $40,750 profit 🎊 Please activate with $8,150.",
      "🎊 Fantastic! You've won $46,900 profit 🌟 Deposit $9,380 now to activate it.",
      "🌟 Cheers to you! Your profit prize is $52,600 🎉 Kindly proceed with $10,500 activation.",
      "🎉 Amazing win! You just secured $61,400 profit 👑 Activate now with $12,200.",
      "👏 Bravo! You've been credited with $67,800 profit 🎊 Deposit $13,560 to activate it.",
      "🌟 Wonderful! You're awarded $74,200 profit 🎉 Kindly activate with $14,800.",
      "🎊 Cheers! Your prize balance of $80,500 profit is waiting 👑 Deposit $16,100 now to activate.",
      "🎉 Congratulations dear! You've unlocked $86,900 profit 👏 Kindly deposit $17,380 to proceed.",
      "🌟 Fantastic win! Your prize is $91,700 profit 🎊 Activate now with $18,340.",
      "🎉 Congratulations! You've just secured $95,300 profit 👑 Kindly proceed with $19,100 to activate it.",
    ];

    res.json({
      success: true,
      messages: validMessages,
      total: validMessages.length,
    });
  } catch (error) {
    console.error("Error fetching ping messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Ping Notification Management Routes
router.post("/users/:id/ping", adminProtect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.params.id;

    // Validate message
    const validMessages = [
      "UPGRADE YOUR ACCOUNT TO BASIC PLAN TO ACTIVATE VOUCHER OF $2000",
      "UPGRADE YOUR ACCOUNT TO PROFESSIONAL TO ACTIVATE VOUCHER OF $5500",
      "GET UP TO $3500 IN BONUS CREDIT BY ADDING $550 FOR ACTIVATION",
      "CONGRATULATIONS YOU ARE ALMOST AT THE VIP PLAN UPGRADE YOUR ACCOUNT TO CLAIM VOUCHER OF $30000",
      "A MINING BONUS OF $90624 HAVE BEEN ADDED TO YOUR ACCOUNT CONTACT THE SUPPORT FOR GUIDANCE ON HOW TO CLAIM IT",
      // New promotional messages
      "Congratulations 🎊 You just won $5,420 profit, kindly deposit $1,014 to activate your Professional Plan.",
      "Bravo 👏 You've been awarded $2,054 profit, activation requires only $460 to proceed.",
      "Well done 🎉 Your profit prize of $3,760 is ready! Kindly activate with $740.",
      "Amazing 👑 You secured $6,820 profit, kindly deposit $1,360 to activate it.",
      "Congratulations 🌟 You won $4,250 profit, activate now with just $850.",
      "Cheers 🎊 Your $7,940 profit is waiting, kindly activate with $1,590.",
      "Wonderful 👏 You earned $3,360 profit, activation deposit required is $670.",
      "Congratulations 🎉 Your prize of $8,250 profit is available, deposit $1,650 to activate.",
      "Fantastic 🌟 You've won $5,910 profit, kindly deposit $1,190 to activate it.",
      "Bravo 🎊 You're awarded $2,980 profit, activation requires only $600.",
      "Cheers 👏 Your $6,480 profit is credited, activate it now with $1,300.",
      "Congratulations 🎉 You just secured $4,670 profit, activation deposit: $930.",
      "Great job 👑 You've unlocked $7,520 profit, kindly activate with $1,510.",
      "Fantastic 🌟 Your profit prize is $3,480, kindly deposit $700 to activate.",
      "Well done 🎊 You're rewarded with $9,240 profit, kindly deposit $1,850 for activation.",
      "Congratulations 👏 You just earned $5,350 profit, activation deposit: $1,070.",
      "Cheers 🎉 Your prize of $2,750 profit is here, activate with $550 only.",
      "Bravo 🌟 You won $8,640 profit, kindly deposit $1,720 to activate.",
      "Wonderful 🎊 Your profit reward is $4,820, activation requires $960.",
      "Congratulations 👑 You just secured $6,990 profit, deposit $1,420 to activate it.",
      // Premium profit messages
      "🎉 Congratulations dear! You've just won $10,000 profit 🎊 Kindly deposit $2,000 to activate your plan.",
      "👑 Bravo! Your account has been credited with $15,800 profit 🌟 Activate now with just $3,200.",
      "🎊 Cheers! You've unlocked $21,600 profit 👏 Please deposit $4,320 to proceed.",
      "🌟 Wonderful news! Your profit prize of $28,500 is ready 🎉 Kindly activate with $5,700.",
      "🎉 Congratulations! You've earned $33,200 profit 👑 Deposit $6,600 to activate your professional plan.",
      "👏 Great job! Your balance shows $40,750 profit 🎊 Please activate with $8,150.",
      "🎊 Fantastic! You've won $46,900 profit 🌟 Deposit $9,380 now to activate it.",
      "🌟 Cheers to you! Your profit prize is $52,600 🎉 Kindly proceed with $10,500 activation.",
      "🎉 Amazing win! You just secured $61,400 profit 👑 Activate now with $12,200.",
      "👏 Bravo! You've been credited with $67,800 profit 🎊 Deposit $13,560 to activate it.",
      "🌟 Wonderful! You're awarded $74,200 profit 🎉 Kindly activate with $14,800.",
      "🎊 Cheers! Your prize balance of $80,500 profit is waiting 👑 Deposit $16,100 now to activate.",
      "🎉 Congratulations dear! You've unlocked $86,900 profit 👏 Kindly deposit $17,380 to proceed.",
      "🌟 Fantastic win! Your prize is $91,700 profit 🎊 Activate now with $18,340.",
      "🎉 Congratulations! You've just secured $95,300 profit 👑 Kindly proceed with $19,100 to activate it.",
    ];

    if (!message || !validMessages.includes(message)) {
      return res.status(400).json({
        message: "Invalid message. Please select a valid promotional message.",
        validMessages,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        pingNotification: {
          isActive: true,
          message: message,
          createdAt: new Date(),
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: `Ping notification sent to ${user.fullName}`,
      data: {
        user: user.fullName,
        notification: user.pingNotification,
      },
    });
  } catch (error) {
    console.error("Ping user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/users/:id/ping", adminProtect, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        pingNotification: {
          isActive: false,
          message: null,
          createdAt: null,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: `Ping notification removed from ${user.fullName}`,
      data: {
        user: user.fullName,
        notification: user.pingNotification,
      },
    });
  } catch (error) {
    console.error("Unping user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users with active ping notifications
router.get("/users/pinged/list", adminProtect, async (req, res) => {
  try {
    const pingedUsers = await User.find({
      "pingNotification.isActive": true,
    })
      .select("fullName email pingNotification createdAt")
      .sort({ "pingNotification.createdAt": -1 });

    res.json({
      success: true,
      data: pingedUsers,
      count: pingedUsers.length,
    });
  } catch (error) {
    console.error("Pinged users fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Pause user earnings
router.post("/users/:id/pause-earnings", adminProtect, async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.admin._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        earningsPaused: true,
        earningsPausedAt: new Date(),
        earningsPausedBy: adminId,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: `Earnings paused for ${user.fullName}`,
      data: {
        user: user.fullName,
        earningsPaused: user.earningsPaused,
        earningsPausedAt: user.earningsPausedAt,
      },
    });
  } catch (error) {
    console.error("Pause earnings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Resume user earnings
router.post("/users/:id/resume-earnings", adminProtect, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        earningsPaused: false,
        earningsPausedAt: null,
        earningsPausedBy: null,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: `Earnings resumed for ${user.fullName}`,
      data: {
        user: user.fullName,
        earningsPaused: user.earningsPaused,
      },
    });
  } catch (error) {
    console.error("Resume earnings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user financial details (balance, earnings, deposits)
router.get("/users/:id/financial", adminProtect, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("🔍 [FINANCIAL] Fetching data for user ID:", userId);

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.log("❌ [FINANCIAL] User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    console.log(
      "✅ [FINANCIAL] User found:",
      user.email,
      "Balance:",
      user.balance
    );

    // Get aggregated financial data
    const [confirmedDeposits, totalProfits, totalWithdrawals, activeDeposits] =
      await Promise.all([
        Transaction.aggregate([
          {
            $match: { userId: user._id, type: "deposit", status: "confirmed" },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Transaction.aggregate([
          { $match: { userId: user._id, type: "profit", status: "completed" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              userId: user._id,
              type: "withdrawal",
              status: { $in: ["confirmed", "completed"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Transaction.find({
          userId: user._id,
          type: "deposit",
          status: "confirmed",
          maturityDate: { $gt: new Date() },
        }).select("amount planId planName maturityDate createdAt"),
      ]);

    // Calculate total earnings from profit transactions
    const calculatedTotalEarnings = totalProfits[0]?.total || 0;

    console.log("📊 [FINANCIAL] Aggregated data:", {
      deposits: confirmedDeposits[0]?.total || 0,
      profits: totalProfits[0]?.total || 0,
      withdrawals: totalWithdrawals[0]?.total || 0,
      calculatedEarnings: calculatedTotalEarnings,
      withdrawableEarnings: user.withdrawableEarnings || 0,
      profitCount: totalProfits[0]?.count || 0,
    });

    const financialData = {
      currentBalance: user.balance || 0,
      totalEarnings: calculatedTotalEarnings,
      withdrawableEarnings: user.withdrawableEarnings || 0,
      totalDeposits: confirmedDeposits[0]?.total || 0,
      totalProfits: totalProfits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      depositCount: confirmedDeposits[0]?.count || 0,
      profitCount: totalProfits[0]?.count || 0,
      withdrawalCount: totalWithdrawals[0]?.count || 0,
      activeDeposits: activeDeposits.length,
      activeDepositsData: activeDeposits,
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
          isVerified: user.isVerified,
        },
        financial: financialData,
      },
    });
  } catch (error) {
    console.error("Get user financial error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add to user balance
router.post("/users/:id/add-balance", adminProtect, async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    if (!reason || reason.trim().length < 5) {
      return res
        .status(400)
        .json({ message: "Reason is required (minimum 5 characters)" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldBalance = user.balance || 0;
    const newBalance = oldBalance + parseFloat(amount);

    // Update user balance
    await User.findByIdAndUpdate(userId, {
      balance: newBalance,
    });

    // Create transaction record for audit trail
    const transaction = new Transaction({
      userId: userId,
      type: "balance_adjustment",
      amount: parseFloat(amount),
      status: "completed",
      description: `Admin balance adjustment: ${reason}`,
      processedBy: req.admin.id,
      processedAt: new Date(),
      adminNotes: `Balance adjusted from $${oldBalance.toFixed(
        2
      )} to $${newBalance.toFixed(2)}. Reason: ${reason}`,
    });

    await transaction.save();

    // Send email notification to user
    try {
      const email = emailTemplates.adminAction(
        user.fullName,
        "Balance Adjustment",
        parseFloat(amount),
        reason
      );
      await sendEmail({
        email: user.email,
        subject: email.subject,
        message: email.message,
        html: email.html,
      });
    } catch (emailError) {
      console.error("Error sending admin action email:", emailError);
    }

    res.json({
      success: true,
      message: `Added $${amount} to ${user.fullName}'s balance`,
      data: {
        user: user.fullName,
        oldBalance: oldBalance,
        amountAdded: parseFloat(amount),
        newBalance: newBalance,
        reason: reason,
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    console.error("Add balance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add to user earnings
router.post("/users/:id/add-earnings", adminProtect, async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    if (!reason || reason.trim().length < 5) {
      return res
        .status(400)
        .json({ message: "Reason is required (minimum 5 characters)" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldEarnings = user.totalEarnings || 0;
    const newEarnings = oldEarnings + parseFloat(amount);

    // Update user earnings
    await User.findByIdAndUpdate(userId, {
      totalEarnings: newEarnings,
    });

    // Create transaction record for audit trail
    const transaction = new Transaction({
      userId: userId,
      type: "earnings_adjustment",
      amount: parseFloat(amount),
      status: "completed",
      description: `Admin earnings adjustment: ${reason}`,
      processedBy: req.admin.id,
      processedAt: new Date(),
      adminNotes: `Earnings adjusted from $${oldEarnings.toFixed(
        2
      )} to $${newEarnings.toFixed(2)}. Reason: ${reason}`,
    });

    await transaction.save();

    // Send email notification to user
    try {
      const email = emailTemplates.adminAction(
        user.fullName,
        "Earnings Adjustment",
        parseFloat(amount),
        reason
      );
      await sendEmail({
        email: user.email,
        subject: email.subject,
        message: email.message,
        html: email.html,
      });
    } catch (emailError) {
      console.error("Error sending admin action email:", emailError);
    }

    res.json({
      success: true,
      message: `Added $${amount} to ${user.fullName}'s earnings`,
      data: {
        user: user.fullName,
        oldEarnings: oldEarnings,
        amountAdded: parseFloat(amount),
        newEarnings: newEarnings,
        reason: reason,
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    console.error("Add earnings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Set withdrawable earnings for user
router.post(
  "/users/:userId/withdrawable-earnings",
  adminProtect,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, reason } = req.body;

      if (!amount || !reason) {
        return res
          .status(400)
          .json({ message: "Amount and reason are required" });
      }

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const oldWithdrawableEarnings = user.withdrawableEarnings || 0;
      const newWithdrawableEarnings = Math.max(0, parseFloat(amount)); // Ensure non-negative

      // Validate that withdrawable earnings don't exceed total earnings
      if (newWithdrawableEarnings > user.totalEarnings) {
        return res.status(400).json({
          message: "Withdrawable earnings cannot exceed total earnings",
          totalEarnings: user.totalEarnings,
          requestedAmount: newWithdrawableEarnings,
        });
      }

      // Update user withdrawable earnings
      await User.findByIdAndUpdate(userId, {
        withdrawableEarnings: newWithdrawableEarnings,
      });

      // Send email notification to user
      try {
        const email = emailTemplates.adminAction(
          user.fullName,
          "Withdrawable Earnings Update",
          newWithdrawableEarnings,
          reason
        );
        await sendEmail({
          email: user.email,
          subject: email.subject,
          message: email.message,
          html: email.html,
        });
      } catch (emailError) {
        console.error(
          "Error sending withdrawable earnings notification email:",
          emailError
        );
      }

      res.json({
        success: true,
        message: `Set withdrawable earnings to $${newWithdrawableEarnings.toFixed(
          2
        )} for ${user.fullName}`,
        data: {
          user: user.fullName,
          oldWithdrawableEarnings: oldWithdrawableEarnings,
          newWithdrawableEarnings: newWithdrawableEarnings,
          totalEarnings: user.totalEarnings,
          reason: reason,
        },
      });
    } catch (error) {
      console.error("Set withdrawable earnings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Manual profit calculation endpoint for testing
router.post("/run-profit-calculation", adminProtect, async (req, res) => {
  try {
    const calculateDailyProfits = (
      await import("../scripts/calculateProfits.js")
    ).default;
    await calculateDailyProfits();
    res.json({
      success: true,
      message: "Profit calculation completed successfully",
    });
  } catch (error) {
    console.error("Manual profit calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Profit calculation failed",
      error: error.message,
    });
  }
});

export default router;
