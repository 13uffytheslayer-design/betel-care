// 种子数据初始化
import { db, initSchema } from "../database";
import { categorySeed } from "./categories";
import { deviceSeed } from "./devices";
import { faultSeed } from "./faults";
import { feedbackSeed } from "./feedbacks";
import { ensureAdminAccount } from "./admin";

let seeded = false;

export function ensureSeed(): void {
  if (seeded) return;
  initSchema();

  // 检查是否已有种子数据
  const catCount = db
    .prepare("SELECT COUNT(*) as c FROM device_categories")
    .get() as { c: number };

  if (catCount.c === 0) {
    const insertCat = db.prepare(
      "INSERT INTO device_categories (id, name, icon, description) VALUES (?, ?, ?, ?)",
    );
    const insertDev = db.prepare(
      "INSERT INTO devices (id, category_id, model, name, status, specs_json, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    const insertFault = db.prepare(
      "INSERT INTO faults (id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const insertFb = db.prepare(
      "INSERT INTO feedbacks (id, user_id, category_id, device_id, type, title, description, problem_category, severity, status, reply, images_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    const tx = db.transaction(() => {
      for (const c of categorySeed) {
        insertCat.run(c.id, c.name, c.icon, c.description);
      }
      for (const d of deviceSeed) {
        insertDev.run(
          d.id,
          d.category_id,
          d.model,
          d.name,
          d.status,
          d.specs_json,
          d.image_url,
        );
      }
      for (const f of faultSeed) {
        insertFault.run(
          f.id,
          f.category_id,
          f.title,
          f.symptom,
          f.cause,
          f.severity,
          f.frequency,
          f.solution_json,
          f.related_ids_json,
        );
      }
      for (const fb of feedbackSeed) {
        insertFb.run(
          fb.id,
          fb.user_id,
          fb.category_id,
          fb.device_id,
          fb.type,
          fb.title,
          fb.description,
          fb.problem_category,
          fb.severity,
          fb.status,
          fb.reply,
          fb.images_json,
          fb.created_at,
        );
      }
    });
    tx();
    console.log("[seed] 槟榔设备种子数据已写入");
  }

  // 确保管理员账号存在
  ensureAdminAccount();

  seeded = true;
}

// 启动时确保初始化
ensureSeed();
