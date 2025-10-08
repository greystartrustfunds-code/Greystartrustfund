import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    withdrawableEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdraws: {
      type: Number,
      default: 0,
      min: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    earningsPaused: {
      type: Boolean,
      default: false,
    },
    earningsPausedAt: {
      type: Date,
    },
    earningsPausedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    pingNotification: {
      isActive: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        enum: [
          "UPGRADE YOUR ACCOUNT TO BASIC PLAN TO ACTIVATE VOUCHER OF $2000",
          "UPGRADE YOUR ACCOUNT TO PROFESSIONAL TO ACTIVATE VOUCHER OF $5500",
          "GET UP TO $3500 IN BONUS CREDIT BY ADDING $550 FOR ACTIVATION",
          "CONGRATULATIONS YOU ARE ALMOST AT THE VIP PLAN UPGRADE YOUR ACCOUNT TO CLAIM VOUCHER OF $30000",
          "A MINING BONUS OF $90624 HAVE BEEN ADDED TO YOUR ACCOUNT CONTACT THE SUPPORT FOR GUIDANCE ON HOW TO CLAIM IT",
        ],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
