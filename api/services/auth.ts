// 简易鉴权工具（演示用，生产环境应使用 bcrypt + JWT 库）
import crypto from "crypto";

const SECRET = "betel-platform-demo-secret-2026";

// 简单 hash（演示用途，避免 bcrypt 原生编译依赖）
export function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(password)
    .digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// 简易 token：base64(userId|email|expire|sig)
export function makeToken(userId: number, email: string): string {
  const expire = Date.now() + 7 * 24 * 3600 * 1000; // 7 天
  const payload = `${userId}|${email}|${expire}`;
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .substring(0, 16);
  return Buffer.from(`${payload}|${sig}`).toString("base64");
}

export interface TokenPayload {
  userId: number;
  email: string;
  expire: number;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split("|");
    if (parts.length !== 4) return null;
    const userId = parseInt(parts[0], 10);
    const email = parts[1];
    const expire = parseInt(parts[2], 10);
    const sig = parts[3];
    if (Number.isNaN(userId) || Number.isNaN(expire)) return null;
    if (expire < Date.now()) return null;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(`${userId}|${email}|${expire}`)
      .digest("hex")
      .substring(0, 16);
    if (sig !== expectedSig) return null;
    return { userId, email, expire };
  } catch {
    return null;
  }
}

import type { Request, Response, NextFunction } from "express";
import { db } from "../db/database";

// 带 userId 的请求类型
export interface AuthedRequest extends Request {
  userId?: number;
  userEmail?: string;
  userRole?: string;
}

export function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "未登录" });
    return;
  }
  const token = header.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: "登录已过期" });
    return;
  }
  req.userId = payload.userId;
  req.userEmail = payload.email;
  next();
}

// 软鉴权：有 token 则填充 userId，无 token 也不拒绝（用于匿名也允许但登录更优的接口）
export function softAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    const token = header.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }
  }
  next();
}

// 管理员鉴权：必须登录且 role === 'admin'
export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "未登录" });
    return;
  }
  const token = header.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: "登录已过期" });
    return;
  }
  const row = db
    .prepare("SELECT role FROM users WHERE id = ?")
    .get(payload.userId) as { role: string } | undefined;
  if (!row || row.role !== "admin") {
    res.status(403).json({ success: false, error: "需要管理员权限" });
    return;
  }
  req.userId = payload.userId;
  req.userEmail = payload.email;
  req.userRole = row.role;
  next();
}
