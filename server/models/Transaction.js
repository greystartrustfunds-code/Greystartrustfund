import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "investment", "profit", "referral_bonus"],
    required: true,
  },
  planId: {
    type: String,
    required: function () {
      return this.type === "investment";
    },
  },
  planName: String,
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "completed",
      "failed",
      "cancelled",
      "active",
    ],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: [
      "bitcoin",
      "usdt",
      "tron",
      "usdc",
      "bep20",
      // withdrawal-specific placeholders
      "bank_withdrawal",
      "crypto_withdrawal",
    ],
    required: function () {
      return this.type === "deposit" || this.type === "withdrawal";
    },
  },
  walletAddress: String,
  txHash: String,
  accountType: {
    type: String,
    enum: ["bank", "crypto"],
    required: function () {
      return this.type === "withdrawal";
    },
  },
  accountDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: function () {
      return this.type === "withdrawal";
    },
  },
  description: String,
  adminNotes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  processedAt: Date,
  expiresAt: Date,
  selectedAccount: String,
  paymentProofUrl: String,
  expectedProfit: {
    type: Number,
    min: 0,
  },
  maturityDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

// Pre-save hook to validate and fix common issues
transactionSchema.pre("save", function (next) {
  // Auto-fix invalid status values
  const validStatuses = [
    "pending",
    "confirmed",
    "completed",
    "failed",
    "cancelled",
    "active",
  ];
  if (!validStatuses.includes(this.status)) {
    console.log(
      `Auto-fixing invalid status "${this.status}" to "pending" for transaction ${this._id}`
    );
    this.status = "pending";
  }

  // Ensure deposit transactions have proper maturity dates (minimum 7 days)
  if (this.type === "deposit" && this.maturityDate) {
    const sevenDaysFromCreation = new Date(
      this.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    if (this.maturityDate < sevenDaysFromCreation) {
      this.maturityDate = new Date(
        this.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      console.log(`Auto-fixed short maturity date for deposit ${this._id}`);
    }
  }

  next();
});

export default mongoose.model("Transaction", transactionSchema);
