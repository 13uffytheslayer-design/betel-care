import { Router } from "express";
import { db } from "../db/database";
import {
  authMiddleware,
  type AuthedRequest,
  hashPassword,
  makeToken,
  verifyPassword,
} from "../services/auth";
import type { User, UserRole } from "@shared/types";

const router = Router();

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  company: string | null;
  created_at: string;
}

function toUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role as UserRole,
    company: r.company || undefined,
    createdAt: r.created_at,
  };
}

// 注册
router.post("/register", (req, res) => {
  const { email, password, name, company, role } = req.body || {};
  if (!email || !password || !name) {
    res.status(400).json({ success: false, error: "邮箱、密码、姓名为必填" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, error: "密码至少 6 位" });
    return;
  }
  const exist = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exist) {
    res.status(409).json({ success: false, error: "该邮箱已注册" });
    return;
  }
  const hash = hashPassword(password);
  const result = db
    .prepare(
      "INSERT INTO users (email, password_hash, name, role, company) VALUES (?, ?, ?, ?, ?)",
    )
    .run(email, hash, name, role === "engineer" ? "engineer" : "user", company || null);
  const row = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(result.lastInsertRowid) as UserRow;
  const token = makeToken(row.id, row.email);
  res.json({ success: true, data: { token, user: toUser(row) } });
});

// 登录
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ success: false, error: "邮箱和密码为必填" });
    return;
  }
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | UserRow
    | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) {
    res.status(401).json({ success: false, error: "邮箱或密码错误" });
    return;
  }
  const token = makeToken(row.id, row.email);
  res.json({ success: true, data: { token, user: toUser(row) } });
});

// 演示账号快捷登录
router.post("/demo", (_req, res) => {
  const email = "demo@betel.com";
  let row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | UserRow
    | undefined;
  if (!row) {
    const hash = hashPassword("demo123");
    const result = db
      .prepare(
        "INSERT INTO users (email, password_hash, name, role, company) VALUES (?, ?, ?, 'engineer', '演示工厂')",
      )
      .run(email, hash, "演示工程师");
    row = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as UserRow;
  }
  const token = makeToken(row.id, row.email);
  res.json({ success: true, data: { token, user: toUser(row) } });
});

// 获取当前用户
router.get("/me", authMiddleware, (req: AuthedRequest, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId) as
    | UserRow
    | undefined;
  if (!row) {
    res.status(404).json({ success: false, error: "用户不存在" });
    return;
  }
  res.json({ success: true, data: toUser(row) });
});

export default router;
