import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Plan from "../models/Plan.js";

const calculateDailyProfits = async () => {
  try {
    console.log("Starting 3-day profit calculation...");

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

    // Auto-fix any deposits with invalid maturity dates (less than 7 days from creation)
    const depositsToFix = activeDeposits.filter((deposit) => {
      const sevenDaysFromCreation = new Date(
        deposit.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      return deposit.maturityDate < sevenDaysFromCreation;
    });

    if (depositsToFix.length > 0) {
      console.log(
        `Auto-fixing ${depositsToFix.length} deposits with short maturity dates...`
      );
      for (const deposit of depositsToFix) {
        const newMaturityDate = new Date(
          deposit.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        await Transaction.findByIdAndUpdate(deposit._id, {
          maturityDate: newMaturityDate,
        });
        console.log(`Fixed maturity date for deposit ${deposit._id}`);
      }
    }

    for (const deposit of activeDeposits) {
      try {
        // Check if user's earnings are paused
        if (deposit.userId.earningsPaused) {
          console.log(
            `Earnings paused for user ${deposit.userId.fullName} (${deposit.userId._id}), skipping deposit ${deposit._id}`
          );
          continue;
        }

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
              duration: "240 hours", // 10 cycles of 3 days (30 days total)
              type: "every_3_days",
            },
            {
              id: "basic",
              name: "Basic Plan",
              profit: 15,
              duration: "240 hours", // 10 cycles of 3 days (30 days total)
              type: "every_3_days",
            },
            {
              id: "professional",
              name: "Professional Plan",
              profit: 30,
              duration: "240 hours", // 10 cycles of 3 days (30 days total)
              type: "every_3_days",
            },
            {
              id: "vip",
              name: "Vip Plan",
              profit: 60,
              duration: "240 hours", // 10 cycles of 3 days (30 days total)
              type: "every_3_days",
            },
          ];
          plan = hardcodedPlans.find((p) => p.id === deposit.planId);
        }

        if (!plan) {
          console.log(`Plan not found for deposit ${deposit._id}, skipping...`);
          continue;
        }

        // Check if enough time has passed since deposit creation (72 hours for 3-day profits)
        const depositDate = new Date(deposit.createdAt);
        const currentTime = new Date();
        const timeDiffHours = (currentTime - depositDate) / (1000 * 60 * 60);

        // For 3-day profit plans, we pay every 72 hours (3 days)
        const shouldPayProfit = timeDiffHours >= 72;

        if (!shouldPayProfit) {
          console.log(
            `Not yet time to pay profit for deposit ${
              deposit._id
            }. Time passed: ${timeDiffHours.toFixed(
              2
            )} hours, Required: 72 hours`
          );
          continue;
        }

        // Calculate how many 3-day periods of profit should have been paid
        const threeDayPeriods = Math.floor(timeDiffHours / 72);
        console.log(
          `Deposit ${deposit._id}: ${threeDayPeriods} 3-day periods since creation`
        );

        // Check how many profit payments have been made for this deposit
        const existingProfitsCount = await Transaction.countDocuments({
          userId: deposit.userId._id,
          type: "profit",
          description: { $regex: deposit._id.toString() },
        });

        console.log(
          `Existing profits for this deposit: ${existingProfitsCount}, Should have: ${threeDayPeriods}`
        );

        // Calculate how many profits are due
        const profitsDue = threeDayPeriods - existingProfitsCount;

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
          if (plan.type === "every_3_days") {
            // 3-day profit (percentage per 3-day period)
            profitAmount = (deposit.amount * plan.profit) / 100;
          } else {
            // Fallback for other types
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
            description: `3-day profit from ${
              plan.name || plan.id
            } plan - Deposit: $${deposit.amount} (${deposit._id}) - Period ${
              existingProfitsCount + i + 1
            }`,
            planId: deposit.planId,
            planName: plan.name || plan.id,
          });

          await profitTransaction.save();

          console.log(
            `Added $${profitAmount.toFixed(2)} profit (Period ${
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

    console.log("3-day profit calculation completed");
  } catch (error) {
    console.error("Error in 3-day profit calculation:", error);
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
