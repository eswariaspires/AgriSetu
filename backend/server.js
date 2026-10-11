import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import produceRoutes from "./routes/produceRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

const app = express();
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/produce", produceRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AgriSetu Backend is running"
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`AgriSetu backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });