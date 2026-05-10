import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { errorMiddleware, notFoundMiddleware } from "./middleware/errorMiddleware";
import achievementRoutes from "./routes/achievementRoutes";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import certificateRoutes from "./routes/certificateRoutes";
import commentRoutes from "./routes/commentRoutes";
import contactRoutes from "./routes/contactRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import postRoutes from "./routes/postRoutes";
import profileRoutes from "./routes/profileRoutes";
import projectRoutes from "./routes/projectRoutes";
import reactionRoutes from "./routes/reactionRoutes";
import tagRoutes from "./routes/tagRoutes";
import timelineRoutes from "./routes/timelineRoutes";

const app = express();

const allowedOrigins = new Set([
  env.FRONTEND_URL,
  env.BACKEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003"
]);

const isLocalOrigin = (origin: string) => {
  try {
    const url = new URL(origin);
    return (
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname) ||
      url.hostname.startsWith("192.168.") ||
      url.hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isLocalOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "HerCodeHerStory backend is healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", commentRoutes);
app.use("/api", reactionRoutes);
app.use("/api", contactRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const server = app.listen(env.PORT, () => {
  console.log(`HerCodeHerStory backend is running on port ${env.PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
