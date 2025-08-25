import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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
      "https://greystartrustfund.vercel.app",
      "https://greystartrustfund.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
