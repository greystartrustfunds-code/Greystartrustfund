import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cron from "node-cron";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import calculateDailyProfits from "./scripts/calculateProfits.js";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

connectDB();

// Set CORS policy based on environment
let corsOptions;
if (process.env.NODE_ENV === "production") {
  corsOptions = {
    origin: process.env.CORS_ORIGIN_PROD?.split(",") || [],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
} else {
  corsOptions = {
    origin: process.env.CORS_ORIGIN_DEV?.split(",") || [
      "http://localhost:3838",
      "http://127.0.0.1:3838",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "GREYSTAR TRUST FUND API Server" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Schedule profit calculation every hour to catch profits throughout the day
cron.schedule("0 * * * *", async () => {
  console.log("Running hourly profit calculation...");
  try {
    await calculateDailyProfits();
    console.log("Hourly profit calculation completed successfully");
  } catch (error) {
    console.error("Hourly profit calculation failed:", error);
  }
});

// Also run at server startup to catch any missed profits
console.log("Running initial profit calculation at startup...");
calculateDailyProfits()
  .then(() => {
    console.log("Initial profit calculation completed");
  })
  .catch((error) => {
    console.error("Initial profit calculation failed:", error);
  });
