// 反馈服务 + 统计
import { db } from "../db/database";
import type {
  Feedback,
  FeedbackStats,
  FeedbackType,
  Severity,
} from "@shared/types";
import { classifyFeedback } from "./classifier";

interface FeedbackRow {
  id: string;
  user_id: number | null;
  category_id: string;
  device_id: string | null;
  type: string;
  title: string;
  description: string;
  problem_category: string;
  severity: string;
  status: string;
  reply: string | null;
  images_json: string | null;
  created_at: string;
}

const SEVERITY_ORDER: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function mapFeedback(r: FeedbackRow, userName?: string): Feedback {
  return {
    id: r.id,
    userId: r.user_id,
    userName,
    categoryId: r.category_id,
    deviceId: r.device_id || undefined,
    type: r.type as FeedbackType,
    title: r.title,
    description: r.description,
    problemCategory: r.problem_category,
    severity: r.severity as Severity,
    status: r.status as Feedback["status"],
    reply: r.reply || undefined,
    images: r.images_json ? JSON.parse(r.images_json) : undefined,
    createdAt: r.created_at,
  };
}

export function createFeedback(input: {
  userId: number | null;
  categoryId: string;
  deviceId?: string;
  type: FeedbackType;
  title: string;
  description: string;
  images?: string[];
}): Feedback {
  const classified = classifyFeedback(
    input.title + " " + input.description,
    input.categoryId,
  );
  const id = "fb-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const imagesJson = input.images && input.images.length > 0 ? JSON.stringify(input.images) : null;
  db.prepare(
    `INSERT INTO feedbacks (id, user_id, category_id, device_id, type, title, description, problem_category, severity, status, images_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
  ).run(
    id,
    input.userId,
    input.categoryId,
    input.deviceId || null,
    input.type,
    input.title,
    input.description,
    classified.problemCategory,
    classified.severity,
    imagesJson,
  );
  const row = db
    .prepare("SELECT * FROM feedbacks WHERE id = ?")
    .get(id) as FeedbackRow;
  return mapFeedback(row);
}

export function listAllFeedbacks(): Feedback[] {
  const rows = db
    .prepare("SELECT * FROM feedbacks ORDER BY created_at DESC")
    .all() as FeedbackRow[];
  return rows.map((r) => mapFeedback(r));
}

export function listUserFeedbacks(userId: number): Feedback[] {
  const rows = db
    .prepare("SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as FeedbackRow[];
  return rows.map((r) => mapFeedback(r));
}

export function getFeedbackStats(): FeedbackStats {
  const total = (db.prepare("SELECT COUNT(*) as c FROM feedbacks").get() as { c: number }).c;

  // 按类型
  const typeRows = db
    .prepare("SELECT type, COUNT(*) as c FROM feedbacks GROUP BY type")
    .all() as Array<{ type: string; c: number }>;
  const byType = { exception: 0, suggestion: 0 };
  for (const r of typeRows) {
    if (r.type === "exception") byType.exception = r.c;
    if (r.type === "suggestion") byType.suggestion = r.c;
  }

  // 按设备板块
  const catRows = db
    .prepare(
      `SELECT f.category_id, c.name, COUNT(*) as c
       FROM feedbacks f
       LEFT JOIN device_categories c ON c.id = f.category_id
       GROUP BY f.category_id
       ORDER BY c DESC`,
    )
    .all() as Array<{ category_id: string; name: string; c: number }>;

  // 按问题类别（聚类）
  const pcRows = db
    .prepare(
      "SELECT problem_category, COUNT(*) as c FROM feedbacks GROUP BY problem_category ORDER BY c DESC",
    )
    .all() as Array<{ problem_category: string; c: number }>;

  // 按严重度
  const sevRows = db
    .prepare("SELECT severity, COUNT(*) as c FROM feedbacks GROUP BY severity")
    .all() as Array<{ severity: string; c: number }>;
  const sevMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const r of sevRows) sevMap[r.severity] = r.c;

  // 趋势（最近14天）
  const trendRows = db
    .prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as c
       FROM feedbacks
       WHERE created_at >= datetime('now', '-14 days')
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
    )
    .all() as Array<{ date: string; c: number }>;

  // 词云（基于标题+描述关键词提取）
  const allText = db
    .prepare("SELECT title, description FROM feedbacks")
    .all() as Array<{ title: string; description: string }>;
  const topKeywords = extractKeywords(
    allText.map((t) => t.title + " " + t.description),
  );

  const resolved = (db.prepare("SELECT COUNT(*) as c FROM feedbacks WHERE status = 'resolved'").get() as { c: number }).c;

  return {
    total,
    byType,
    byCategory: catRows.map((r) => ({
      categoryId: r.category_id,
      name: r.name || r.category_id,
      count: r.c,
    })),
    byProblemCategory: pcRows.map((r) => ({ name: r.problem_category, count: r.c })),
    bySeverity: (["low", "medium", "high", "critical"] as const).map((s) => ({
      severity: s,
      count: sevMap[s] || 0,
    })),
    trend: trendRows.map((r) => ({ date: r.date, count: r.c })),
    topKeywords,
    resolvedRate: total > 0 ? Math.round((resolved / total) * 1000) / 10 : 0,
  };
}

// 关键词提取（简易中文分词：基于词库匹配）
const KEYWORD_DICT = [
  "剔除阀", "视觉", "相机", "图像", "光源", "气压", "压缩空气", "振动", "给料",
  "堵料", "良品率", "误剔", "HMI", "触摸屏", "死机", "刀片", "崩刃", "切割",
  "伺服", "报警", "去核", "夹爪", "安全门", "传送带", "跑偏", "挡板", "HALCON",
  "授权", "产能", "槟榔", "含水率", "硬度", "烘干", "色差", "厚度", "精度",
  "网络", "数据丢失", "说明书", "字体", "App", "保养", "稼动率", "批次",
  "滤芯", "冷干机", "气缸", "编码器", "驱动器", "电机", "继电器",
];

function extractKeywords(texts: string[]): Array<{ word: string; weight: number }> {
  const counter: Record<string, number> = {};
  for (const text of texts) {
    for (const kw of KEYWORD_DICT) {
      let idx = 0;
      while ((idx = text.indexOf(kw, idx)) !== -1) {
        counter[kw] = (counter[kw] || 0) + 1;
        idx += kw.length;
      }
    }
  }
  return Object.entries(counter)
    .map(([word, weight]) => ({ word, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 24);
}

export function replyFeedback(id: string, reply: string): boolean {
  const result = db
    .prepare("UPDATE feedbacks SET reply = ?, status = 'resolved' WHERE id = ?")
    .run(reply, id);
  return result.changes > 0;
}

export function updateFeedbackStatus(id: string, status: string): boolean {
  const result = db
    .prepare("UPDATE feedbacks SET status = ? WHERE id = ?")
    .run(status, id);
  return result.changes > 0;
}
