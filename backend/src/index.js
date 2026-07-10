import express from "express";
import cors from "cors";
import "dotenv/config";
import job from "./lib/cron.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT; // Loaded dynamically via root .env runtime configuration files

job.start();
// ==========================================
// Middleware Configurations
// ==========================================
// Adjusts system request body parsing limits up to 10 Megabytes.
// Vital buffer expansion necessary to prevent PayloadTooLargeErrors when receiving raw Base64 image data tables.
app.use(express.json({ limit: "10mb" }));
app.use(cors()); // Enables cross-origin resource requests to accept mobile client interaction packages

// ==========================================
// Controller Endpoint Routing Hooks
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// ==========================================
// Application Server Initialization
// ==========================================
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    connectDB();
});
