import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import cors from "cors";
import { config } from "dotenv";

config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Log to check if ALLOWED_SITE is correctly loaded
console.log("Allowed Site:", process.env.ALLOWED_SITE);

// ✅ CORS Configuration
// const corsOptions = {
//     origin: process.env.ALLOWED_SITE || "*", // Fallback if env is not loaded
//     methods: "GET,POST,PUT,DELETE,OPTIONS",
//     allowedHeaders: "Content-Type, Authorization",
//     credentials: true
// };

// ✅ Apply CORS Middleware
app.use(cors(corsOptions));

// ✅ Handle Preflight Requests
app.options("*", cors(corsOptions));

// ✅ Manually Set CORS Headers (Extra Safety)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ALLOWED_SITE || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// ✅ Define Routes
app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);

export default app;
