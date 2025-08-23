import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "GreyStar Trust Fund API Server" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
