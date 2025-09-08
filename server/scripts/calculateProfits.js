import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Plan from "../models/Plan.js";

const calculateDailyProfits = async () => {
  try {
    console.log("Starting daily profit calculation...");

    // Connect to database if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to database for profit calculation");
    }

    // Get all confirmed deposits that haven't matured yet
    const activeDeposits = await Transaction.find({
      type: "deposit",
      status: "confirmed",
      maturityDate: { $gt: new Date() },
    }).populate("userId");

    console.log(`Found ${activeDeposits.length} active deposits`);

    for (const deposit of activeDeposits) {
      try {
        // Get the plan details
        let plan;
        if (deposit.planId) {
          plan = await Plan.findOne({ id: deposit.planId });
        }

        // If plan not found in DB, use hardcoded plans
        if (!plan) {
          const hardcodedPlans = [
            {
              id: "starter",
              name: "Starter Plan",
              profit: 12,
              duration: "720 hours", // 30 days for daily profits
              type: "daily",
            },
            {
              id: "basic",
              name: "Basic Plan",
              profit: 15,
              duration: "720 hours", // 30 days for daily profits
              type: "daily",
            },
            {
              id: "professional",
              name: "Professional Plan",
              profit: 30,
              duration: "720 hours", // 30 days for daily profits
              type: "daily",
            },
            {
              id: "vip",
              name: "Vip Plan",
              profit: 60,
              duration: "720 hours", // 30 days for daily profits
              type: "daily",
            },
          ];
          plan = hardcodedPlans.find((p) => p.id === deposit.planId);
        }

        if (!plan) {
          console.log(`Plan not found for deposit ${deposit._id}, skipping...`);
          continue;
        }

        // Check if enough time has passed since deposit creation
        const depositDate = new Date(deposit.createdAt);
        const currentTime = new Date();
        const timeDiffHours = (currentTime - depositDate) / (1000 * 60 * 60);

        // Parse plan duration to get hours
        let planDurationHours = 24; // default to 24 hours
        if (plan.duration) {
          const durationMatch = plan.duration.match(/(\d+)\s*hours?/i);
          if (durationMatch) {
            planDurationHours = parseInt(durationMatch[1]);
          }
        }

        // Check if we should pay profit based on plan type and timing
        let shouldPayProfit = false;

        if (plan.type === "daily") {
          // For daily plans (like VIP), pay every 24 hours
          shouldPayProfit = timeDiffHours >= 24;
        } else {
          // For other plans, pay after the specified duration has passed
          shouldPayProfit = timeDiffHours >= planDurationHours;
        }

        if (!shouldPayProfit) {
          console.log(
            `Not yet time to pay profit for deposit ${
              deposit._id
            }. Time passed: ${timeDiffHours.toFixed(
              2
            )} hours, Required: ${planDurationHours} hours`
          );
          continue;
        }

        // Calculate how many days of profit should have been paid
        const daysSinceDeposit = Math.floor(timeDiffHours / 24);
        console.log(
          `Deposit ${deposit._id}: ${daysSinceDeposit} days since creation`
        );

        // Check how many profit payments have been made for this deposit
        const existingProfitsCount = await Transaction.countDocuments({
          userId: deposit.userId._id,
          type: "profit",
          description: { $regex: deposit._id.toString() },
        });

        console.log(
          `Existing profits for this deposit: ${existingProfitsCount}, Should have: ${daysSinceDeposit}`
        );

        // Calculate how many profits are due
        const profitsDue = daysSinceDeposit - existingProfitsCount;

        if (profitsDue <= 0) {
          console.log(`No profits due for deposit ${deposit._id}`);
          continue;
        }

        console.log(
          `Adding ${profitsDue} profit payments for deposit ${deposit._id}`
        );

        // Add all due profit payments
        for (let i = 0; i < profitsDue; i++) {
          // Calculate profit based on plan type
          let profitAmount;
          if (plan.type === "daily") {
            // Daily profit (percentage per day)
            profitAmount = (deposit.amount * plan.profit) / 100;
          } else {
            // One-time profit after duration
            profitAmount = (deposit.amount * plan.profit) / 100;
          }

          // Update user's total earnings
          const userUpdateResult = await User.findByIdAndUpdate(
            deposit.userId._id,
            {
              $inc: { totalEarnings: profitAmount },
            },
            { new: true }
          );

          console.log(
            `Updated user ${deposit.userId.fullName} totalEarnings. New value: $${userUpdateResult.totalEarnings}`
          );

          // Create profit transaction record
          const profitTransaction = new Transaction({
            userId: deposit.userId._id,
            type: "profit",
            amount: profitAmount,
            status: "completed",
            description: `Daily profit from ${
              plan.name || plan.id
            } plan - Deposit: $${deposit.amount} (${deposit._id}) - Day ${
              existingProfitsCount + i + 1
            }`,
            planId: deposit.planId,
            planName: plan.name || plan.id,
          });

          await profitTransaction.save();

          console.log(
            `Added $${profitAmount.toFixed(2)} profit (Day ${
              existingProfitsCount + i + 1
            }) to user ${deposit.userId.fullName} from ${
              plan.name || plan.id
            } plan (Deposit: $${deposit.amount})`
          );
        }
      } catch (error) {
        console.error(`Error processing deposit ${deposit._id}:`, error);
      }
    }

    console.log("Daily profit calculation completed");
  } catch (error) {
    console.error("Error in daily profit calculation:", error);
  }
};

// Run the calculation only if this file is executed directly
if (
  import.meta.url.includes("calculateProfits.js") &&
  process.argv[1].includes("calculateProfits.js")
) {
  dotenv.config();

  calculateDailyProfits()
    .then(() => {
      console.log("Profit calculation script finished");
      return mongoose.connection.close();
    })
    .then(() => {
      console.log("Database connection closed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      mongoose.connection.close().finally(() => process.exit(1));
    });
}

export default calculateDailyProfits;
