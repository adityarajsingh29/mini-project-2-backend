import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import githubRoutes from "./routes/githubRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import errorHandler, { notFound } from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic protection against hammering the GitHub API through our proxy.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please slow down." },
});
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "GitHub Profile Analyzer API is running" });
});

app.use("/api/github", githubRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/favorites", favoritesRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
