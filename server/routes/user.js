import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import Transaction from "../models/Transaction.js";
import Chat from "../models/Chat.js";
import { v2 as cloudinary } from "cloudinary";
import sendEmail, { emailTemplates } from "../utils/email.js";

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Get user balance
router.get("/balance", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      balance: user.balance || 0,
      totalEarnings: user.totalEarnings || 0,
    });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get dashboard data
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get user's transactions
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate balance from confirmed deposits
    const confirmedDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "deposit",
          status: "confirmed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate withdrawals (both confirmed and completed)
    const withdrawals = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "withdrawal",
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate total deposits
    const totalDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "deposit",
          status: { $in: ["confirmed", "pending"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate active deposits (confirmed but not matured)
    const activeDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "deposit",
          status: "confirmed",
          maturityDate: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Debug: Log all user deposits to see what's happening
    console.log("=== DEBUG: User Deposit Analysis ===");
    console.log("User ID:", req.user._id);
    console.log("Current time:", new Date());

    const allUserDeposits = await Transaction.find({
      userId: req.user._id,
      type: "deposit",
    }).sort({ createdAt: -1 });

    console.log(
      "All user deposits:",
      allUserDeposits.map((d) => ({
        id: d._id,
        amount: d.amount,
        status: d.status,
        maturityDate: d.maturityDate,
        isActive: d.status === "confirmed" && d.maturityDate > new Date(),
        createdAt: d.createdAt,
        planId: d.planId,
      }))
    );

    const confirmedDepositsDebug = allUserDeposits.filter(
      (d) => d.status === "confirmed"
    );
    console.log("Confirmed deposits count:", confirmedDepositsDebug.length);

    const activeDepositsDebug = confirmedDepositsDebug.filter(
      (d) => d.maturityDate > new Date()
    );
    console.log("Active deposits count:", activeDepositsDebug.length);
    console.log("=== END DEBUG ===");

    // Get active investments count
    const activeInvestments = await Transaction.countDocuments({
      userId: req.user._id,
      type: "deposit",
      status: "confirmed",
      maturityDate: { $gt: new Date() },
    });

    const confirmedDepositTotal = confirmedDeposits[0]?.total || 0;
    const withdrawalTotal = withdrawals[0]?.total || 0;
    const totalDepositAmount = totalDeposits[0]?.total || 0;
    const activeDepositAmount = activeDeposits[0]?.total || 0;

    // Calculate balance (confirmed deposits - withdrawals)
    const calculatedBalance = confirmedDepositTotal - withdrawalTotal;

    // Update user balance in database
    await User.findByIdAndUpdate(req.user._id, {
      balance: calculatedBalance,
    });

    res.json({
      success: true,
      data: {
        balance: calculatedBalance,
        earnings: user.totalEarnings || 0,
        withdrawableEarnings: user.withdrawableEarnings || 0,
        activeDeposit: activeDepositAmount,
        totalDeposit: totalDepositAmount,
        totalWithdraws: withdrawalTotal,
        activeInvestments,
        recentTransactions: transactions,
        user: {
          name: user.fullName,
          email: user.email,
          joinedDate: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, email, phone },
      { new: true, select: "-password" }
    );

    res.json({ user, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit deposit with payment proof
router.post("/deposit", authenticateToken, async (req, res) => {
  try {
    const { planId, amount, walletType, selectedAccount, paymentProofUrl } =
      req.body;

    // Validate required fields
    if (
      !planId ||
      !amount ||
      !walletType ||
      !selectedAccount ||
      !paymentProofUrl
    ) {
      return res.status(400).json({
        message:
          "All fields are required: planId, amount, walletType, selectedAccount, paymentProofUrl",
      });
    }

    // Find the plan (you might want to create a Plan model or use the hardcoded plans)
    const plans = [
      {
        id: "starter",
        name: "Starter Plan",
        profit: 12,
        duration: "20 hours",
        minAmount: 25,
        maxAmount: 599,
        type: "profit",
      },
      {
        id: "basic",
        name: "Basic Plan",
        profit: 15,
        duration: "48 hours",
        minAmount: 600,
        maxAmount: 999,
        type: "profit",
      },
      {
        id: "professional",
        name: "Professional Plan",
        profit: 30,
        duration: "72 hours",
        minAmount: 1000,
        maxAmount: 9999,
        type: "profit",
      },
      {
        id: "vip",
        name: "Vip Plan",
        profit: 60,
        duration: "24 hours",
        minAmount: 10000,
        maxAmount: Infinity,
        type: "daily",
      },
    ];

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    // Validate amount
    const depositAmount = parseFloat(amount);
    if (depositAmount < plan.minAmount || depositAmount > plan.maxAmount) {
      return res.status(400).json({
        message: `Amount must be between $${plan.minAmount} and $${
          plan.maxAmount === Infinity ? "∞" : plan.maxAmount
        }`,
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user._id,
      type: "deposit",
      amount: depositAmount,
      planId: planId,
      planName: plan.name,
      paymentMethod: walletType, // Fixed: use paymentMethod instead of walletType
      selectedAccount: selectedAccount,
      paymentProofUrl: paymentProofUrl,
      status: "pending",
      expectedProfit: (depositAmount * plan.profit) / 100,
      maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set to 30 days for all investment plans
    });

    await transaction.save();

    res.json({
      message: "Deposit submitted successfully! Payment is being verified.",
      transaction: {
        id: transaction._id,
        amount: depositAmount,
        plan: plan.name,
        status: "pending",
        submittedAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({ message: "Server error processing deposit" });
  }
});

// Get user transactions
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    // Execute paginated query
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error fetching transactions" });
  }
});

// Get single transaction by ID
router.get("/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Server error fetching transaction" });
  }
});

// Upload image to Cloudinary
router.post("/upload-image", authenticateToken, async (req, res) => {
  try {
    console.log("Upload endpoint hit");
    console.log("Cloudinary config check:", {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const { imageData, folder = "payment_proofs" } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: "Image data is required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageData, {
      folder: folder,
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
      ],
    });

    res.json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res
      .status(500)
      .json({ message: "Error uploading image", error: error.message });
  }
});

// Create transaction endpoint (for dashboard deposit form)
router.post("/transactions", authenticateToken, async (req, res) => {
  try {
    console.log("Create transaction request:", req.body);

    // Map frontend account IDs to backend payment methods
    const paymentMethodMap = {
      usdt_trc20: "usdt",
      tron_trc20: "tron",
      bnb_bep20: "bep20",
      btc_bitcoin: "bitcoin",
      eth_ethereum: "usdc", // Map ETH to USDC as closest match
    };

    // If it's form data, handle differently
    let transactionData;
    if (req.body instanceof FormData || req.body.proofOfPayment) {
      // Handle FormData from dashboard deposit modal
      const { amount, type, selectedAccount, status } = req.body;

      const mappedPaymentMethod =
        paymentMethodMap[selectedAccount] || selectedAccount;

      transactionData = new Transaction({
        userId: req.user._id,
        type: type || "deposit",
        amount: parseFloat(amount),
        paymentMethod: mappedPaymentMethod,
        selectedAccount: selectedAccount,
        status: status || "pending",
        planId: "basic", // Default plan for deposits - this can be made dynamic later
        // Note: File upload handling would need to be implemented here
        // For now, just create the transaction without the file
      });
    } else {
      // Handle regular JSON data
      const { selectedAccount, ...otherData } = req.body;
      const mappedPaymentMethod =
        paymentMethodMap[selectedAccount] || selectedAccount;

      transactionData = new Transaction({
        ...otherData,
        userId: req.user._id,
        paymentMethod: mappedPaymentMethod,
        selectedAccount: selectedAccount,
        planId: req.body.planId || "basic", // Default plan if not provided
      });
    }

    await transactionData.save();

    // Send email notification for transactions
    if (transactionData.type === "deposit") {
      try {
        const email = emailTemplates.transactionUpdate(
          req.user.fullName,
          "Deposit",
          transactionData.amount,
          "pending",
          "Your deposit has been received and is pending verification."
        );
        await sendEmail({
          email: req.user.email,
          subject: email.subject,
          message: email.message,
          html: email.html,
        });
      } catch (emailError) {
        console.error("Error sending deposit email:", emailError);
      }
    } else if (transactionData.type === "withdrawal") {
      try {
        const email = emailTemplates.withdrawalRequest(
          req.user.fullName,
          transactionData.amount,
          transactionData.paymentMethod || "Not specified"
        );
        await sendEmail({
          email: req.user.email,
          subject: email.subject,
          message: email.message,
          html: email.html,
        });
      } catch (emailError) {
        console.error("Error sending withdrawal email:", emailError);
      }
    }

    res.json({
      success: true,
      message: "Transaction created successfully",
      transaction: transactionData,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating transaction",
      error: error.message,
    });
  }
});

// Chat Support Endpoints

// Get user's chat or create new one
router.get("/chat", authenticateToken, async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.user._id })
      .populate("userId", "fullName email")
      .populate("adminId", "username")
      .populate("messages.senderId", "fullName username")
      .sort({ lastMessageAt: -1 });

    // If no chat exists, create one
    if (!chat) {
      chat = new Chat({
        userId: req.user._id,
        subject: "General Support",
        status: "open",
      });
      await chat.save();

      // Populate the newly created chat
      chat = await Chat.findById(chat._id)
        .populate("userId", "fullName email")
        .populate("adminId", "username")
        .populate("messages.senderId", "fullName username");
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Server error fetching chat" });
  }
});

// Send message in chat
router.post("/chat/message", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get or create user's chat
    let chat = await Chat.findOne({ userId: req.user._id });

    if (!chat) {
      chat = new Chat({
        userId: req.user._id,
        subject: "General Support",
        status: "open",
      });
    }

    // Add message to chat
    chat.messages.push({
      senderId: req.user._id,
      senderModel: "User",
      message: message.trim(),
    });

    chat.lastMessageAt = new Date();
    chat.status = "open"; // Reopen chat if it was closed

    await chat.save();

    // Return populated chat
    const populatedChat = await Chat.findById(chat._id)
      .populate("userId", "fullName email")
      .populate("adminId", "username")
      .populate("messages.senderId", "fullName username");

    res.json({
      success: true,
      message: "Message sent successfully",
      data: populatedChat,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
});

// Mark messages as read by user
router.patch("/chat/read", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark all admin messages as read by user
    chat.messages.forEach((msg) => {
      if (msg.senderModel === "Admin") {
        msg.isRead = true;
      }
    });

    await chat.save();

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread message count for user
router.get("/chat/unread-count", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });

    if (!chat) {
      return res.json({ success: true, count: 0 });
    }

    const unreadCount = chat.messages.filter(
      (msg) => msg.senderModel === "Admin" && !msg.isRead
    ).length;

    res.json({
      success: true,
      count: unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit withdrawal request
router.post("/withdraw", authenticateToken, async (req, res) => {
  try {
    console.log("Withdraw endpoint hit - body:", req.body);
    const { amount, withdrawalSource, accountType, accountDetails } = req.body;

    // Validate required fields
    if (!amount || !withdrawalSource || !accountType || !accountDetails) {
      return res.status(400).json({
        message:
          "All fields are required: amount, withdrawalSource, accountType, accountDetails",
      });
    }

    // Validate withdrawal source
    if (!["balance", "earnings"].includes(withdrawalSource)) {
      return res.status(400).json({
        message: "Invalid withdrawal source. Must be 'balance' or 'earnings'",
      });
    }

    // Validate amount
    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get user's current balance and earnings
    const user = await User.findById(req.user._id);
    console.log("Withdraw - user lookup:", {
      userId: req.user._id,
      balance: user?.balance,
      withdrawableEarnings: user?.withdrawableEarnings,
      withdrawalSource,
    });

    // Validate sufficient funds based on withdrawal source
    if (withdrawalSource === "balance") {
      if (withdrawalAmount > user.balance) {
        return res
          .status(400)
          .json({ message: "Insufficient balance for withdrawal" });
      }
    } else if (withdrawalSource === "earnings") {
      if (!user.withdrawableEarnings || user.withdrawableEarnings <= 0) {
        return res.status(400).json({
          message: "No earnings are currently approved for withdrawal",
        });
      }
      if (withdrawalAmount > user.withdrawableEarnings) {
        return res.status(400).json({
          message: "Insufficient withdrawable earnings for withdrawal",
        });
      }
    }

    // Validate account details based on type
    if (accountType === "bank") {
      if (
        !accountDetails.bankName ||
        !accountDetails.accountNumber ||
        !accountDetails.accountName
      ) {
        return res.status(400).json({
          message:
            "Bank name, account number, and account name are required for bank withdrawals",
        });
      }
    } else if (accountType === "crypto") {
      if (!accountDetails.walletAddress || !accountDetails.network) {
        return res.status(400).json({
          message:
            "Wallet address and network are required for crypto withdrawals",
        });
      }
    } else {
      return res.status(400).json({
        message: 'Invalid account type. Must be "bank" or "crypto"',
      });
    }

    // Create withdrawal transaction record
    const transaction = new Transaction({
      userId: req.user._id,
      type: "withdrawal",
      amount: withdrawalAmount,
      status: "pending",
      accountType: accountType,
      accountDetails: accountDetails,
      description: `Withdrawal from ${
        withdrawalSource === "balance" ? "account balance" : "approved earnings"
      }`,
      // Store account details in paymentMethod for compatibility
      paymentMethod: `${accountType}_withdrawal`,
    });

    await transaction.save();

    res.json({
      success: true,
      message:
        "Withdrawal request submitted successfully! Admin will process your request.",
      transaction: {
        id: transaction._id,
        amount: withdrawalAmount,
        accountType: accountType,
        status: "pending",
        submittedAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res
      .status(500)
      .json({ message: "Server error processing withdrawal request" });
  }
});

// Get user's ping notification status
router.get("/ping-notification", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("pingNotification");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user.pingNotification || { isActive: false, message: null },
    });
  } catch (error) {
    console.error("Error fetching ping notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reinvest earnings into a new investment plan
router.post("/reinvest", authenticateToken, async (req, res) => {
  try {
    const { amount, planId } = req.body;

    // Validation
    if (!amount || !planId || amount <= 0) {
      return res.status(400).json({
        message: "Amount and plan ID are required, amount must be positive",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has enough earnings
    if (amount > user.totalEarnings) {
      return res.status(400).json({
        message: `Insufficient earnings. Available: $${user.totalEarnings}`,
      });
    }

    // Validate plan and minimum amount
    const plans = {
      starter: {
        name: "Starter Plan",
        minAmount: 25,
        maxAmount: 599,
        profit: 12,
      },
      basic: { name: "Basic Plan", minAmount: 600, maxAmount: 999, profit: 15 },
      professional: {
        name: "Professional Plan",
        minAmount: 1000,
        maxAmount: 9999,
        profit: 30,
      },
      vip: {
        name: "VIP Plan",
        minAmount: 10000,
        maxAmount: Infinity,
        profit: 60,
      },
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    if (amount < selectedPlan.minAmount) {
      return res.status(400).json({
        message: `Minimum amount for ${selectedPlan.name} is $${selectedPlan.minAmount}`,
      });
    }

    if (amount > selectedPlan.maxAmount) {
      return res.status(400).json({
        message: `Maximum amount for ${selectedPlan.name} is $${selectedPlan.maxAmount}`,
      });
    }

    // Calculate maturity date (30 days from now)
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + 30);

    // Create reinvestment transaction (deduction from earnings)
    const reinvestmentTransaction = new Transaction({
      userId: req.user._id,
      type: "reinvestment",
      amount: amount,
      planId: planId,
      planName: selectedPlan.name,
      status: "completed",
      description: `Reinvestment from earnings into ${selectedPlan.name}`,
    });

    await reinvestmentTransaction.save();

    // Create new deposit transaction (the actual new investment)
    const newDepositTransaction = new Transaction({
      userId: req.user._id,
      type: "deposit",
      amount: amount,
      planId: planId,
      planName: selectedPlan.name,
      paymentMethod: "bitcoin", // Default payment method for reinvestment deposits
      status: "confirmed", // Auto-confirm since it's from earnings
      maturityDate: maturityDate,
      description: `Reinvestment deposit - ${selectedPlan.name}`,
    });

    await newDepositTransaction.save();

    // Update user's total earnings (deduct the reinvested amount)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalEarnings: -amount },
    });

    // Send email notification
    const message = `Dear ${user.fullName},

Your reinvestment of $${amount} into the ${selectedPlan.name} has been successfully processed.

Thank you for choosing Greystar Trust Fund.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reinvestment Successful",
        message,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    res.json({
      success: true,
      message: `Successfully reinvested $${amount} into ${selectedPlan.name}`,
      data: {
        reinvestmentTransaction,
        newDepositTransaction,
        remainingEarnings: user.totalEarnings - amount,
      },
    });
  } catch (error) {
    console.error("Reinvestment error:", error);
    res.status(500).json({ message: "Server error during reinvestment" });
  }
});

// Get reinvestment history
router.get("/reinvestments", authenticateToken, async (req, res) => {
  try {
    const reinvestments = await Transaction.find({
      userId: req.user._id,
      type: "reinvestment",
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: reinvestments,
    });
  } catch (error) {
    console.error("Error fetching reinvestments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Test endpoint to check active deposits and trigger profit calculation (for debugging)
router.get("/debug/deposits", authenticateToken, async (req, res) => {
  try {
    const activeDeposits = await Transaction.find({
      userId: req.user._id,
      type: "deposit",
      status: "confirmed",
      maturityDate: { $gt: new Date() },
    });

    const allDeposits = await Transaction.find({
      userId: req.user._id,
      type: "deposit",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        activeDeposits,
        allDeposits,
        currentTime: new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching debug deposits:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
