import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import cors from "cors";
import { config } from "dotenv";
config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: ["https://smart-cv-ai.vercel.app", "http://localhost:5173"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"],  
};

app.use(cors(corsOptions));

app.options("*", (req, res) => {
    res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.set("Access-Control-Allow-Credentials", "true");
    res.status(204).end();
});

app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);

export default app;
