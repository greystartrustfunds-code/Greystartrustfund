import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Admin model
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "super_admin"],
    default: "admin",
  },
  permissions: {
    users: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    plans: { type: Boolean, default: true },
    chat: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://greystartrustfunds:lg0Uoh0u4gRoGca0@cluster0.4tlwsnj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Admin credentials
    const adminData = {
      username: "greystaradmin",
      email: "Greystartrustfunds@gmail.com",
      password: "greystar2025@$",
      role: "super_admin",
      permissions: {
        users: true,
        transactions: true,
        plans: true,
        chat: true,
        analytics: true,
      },
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: adminData.email }, { username: adminData.username }],
    });

    if (existingAdmin) {
      console.log("❌ Admin user already exists with this email or username");
      console.log("Existing admin:", {
        username: existingAdmin.username,
        email: existingAdmin.email,
        role: existingAdmin.role,
      });
      process.exit(1);
    }

    // Hash the password
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create new admin
    const newAdmin = new Admin({
      ...adminData,
      password: hashedPassword,
    });

    await newAdmin.save();

    console.log("✅ Admin user created successfully!");
    console.log("Admin Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👤 Username: ${adminData.username}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔐 Password: ${adminData.password}`);
    console.log(`👑 Role: ${adminData.role}`);
    console.log(`🎛️  Permissions: All enabled`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("🚀 You can now login to the admin panel at: /admin/login");
    console.log("");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);

    if (error.code === 11000) {
      console.log("This error usually means the admin already exists.");
      console.log("Check your database for existing admin users.");
    }
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Run the script
createAdmin();
