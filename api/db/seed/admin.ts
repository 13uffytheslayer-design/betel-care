// 管理员账号种子：确保存在一个默认管理员账号
import { db } from "../database";
import { hashPassword } from "../../services/auth";

// 管理员账号配置（如需修改管理员邮箱/密码，改这里即可）
const ADMIN_EMAIL = "hantargcs@ht.com";
const ADMIN_PASSWORD = "hantar321";
const ADMIN_NAME = "平台管理员";
const ADMIN_COMPANY = "槟榔设备售后平台";
// 历史管理员邮箱：若检测到旧账号，则迁移到新邮箱（避免残留多个管理员）
const LEGACY_ADMIN_EMAIL = "admin@betel.com";

export function ensureAdminAccount(): void {
  const hash = hashPassword(ADMIN_PASSWORD);

  // 1. 若新邮箱已存在，确保密码与角色正确（防止密码被改后无法登录）
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(ADMIN_EMAIL) as { id: number } | undefined;
  if (existing) {
    db.prepare(
      "UPDATE users SET password_hash = ?, role = 'admin', name = ?, company = ? WHERE id = ?",
    ).run(hash, ADMIN_NAME, ADMIN_COMPANY, existing.id);
    return;
  }

  // 2. 迁移历史管理员账号：把旧 admin@betel.com 更新为新邮箱+密码
  const legacy = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(LEGACY_ADMIN_EMAIL) as { id: number } | undefined;
  if (legacy) {
    db.prepare(
      "UPDATE users SET email = ?, password_hash = ?, role = 'admin', name = ?, company = ? WHERE id = ?",
    ).run(ADMIN_EMAIL, hash, ADMIN_NAME, ADMIN_COMPANY, legacy.id);
    console.log(`[seed] 管理员账号已迁移: ${LEGACY_ADMIN_EMAIL} -> ${ADMIN_EMAIL}`);
    return;
  }

  // 3. 全新环境：创建管理员账号
  db.prepare(
    "INSERT INTO users (email, password_hash, name, role, company) VALUES (?, ?, ?, 'admin', ?)",
  ).run(ADMIN_EMAIL, hash, ADMIN_NAME, ADMIN_COMPANY);
  console.log(`[seed] 管理员账号已创建: ${ADMIN_EMAIL}`);
}
