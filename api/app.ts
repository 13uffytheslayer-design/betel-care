/**
 * API server entry
 */
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 触发数据库初始化与种子数据写入
import "./db/seed/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth";
import deviceRoutes from "./routes/devices";
import faultRoutes from "./routes/faults";
import chatRoutes from "./routes/chat";
import feedbackRoutes from "./routes/feedback";

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 请求日志（简易）
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.method !== "OPTIONS") {
    console.log(`[api] ${req.method} ${req.url}`);
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/faults", faultRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "ok" });
});

// 错误处理
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[api] error:", error);
  res.status(500).json({ success: false, error: "服务器内部错误" });
});

// 生产环境：托管前端构建产物（dist/），实现前后端一体部署
const distPath = path.resolve(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback：所有非 /api 的 GET 请求都回退到 index.html（支持前端路由）
  app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  console.log(`[api] 已托管前端静态文件: ${distPath}`);
}

// 404（仅匹配未处理的 /api 请求）
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `接口不存在: ${req.method} ${req.url}` });
});

export default app;
