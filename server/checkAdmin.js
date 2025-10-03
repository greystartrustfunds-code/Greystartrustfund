import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Simple Admin schema without imports
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["admin", "super_admin"], default: "admin" },
  permissions: {
    users: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    plans: { type: Boolean, default: true },
    chat: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.model("Admin", adminSchema);

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    const adminCount = await Admin.countDocuments();
    console.log("Total admins in database:", adminCount);

    if (adminCount === 0) {
      console.log("No admin users found. Creating default admin...");
      const defaultAdmin = new Admin({
        username: "admin",
        email: "admin@greystartrustfund.com",
        password: "admin123",
        role: "super_admin",
      });
      await defaultAdmin.save();
      console.log("Default admin created: username=admin, password=admin123");
    } else {
      const admins = await Admin.find({}, "username email role isActive");
      console.log("Existing admins:", admins);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAdmins();
