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

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    const admin = await Admin.findOne({ username: "greystaradmin" });
    if (admin) {
      console.log("Found admin user");

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      // Update password
      admin.password = hashedPassword;
      await admin.save();

      console.log("Password reset to: admin123");

      // Test the password
      const isMatch = await admin.comparePassword("admin123");
      console.log("Password test result:", isMatch);
    } else {
      console.log("Admin user not found");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

resetAdminPassword();
