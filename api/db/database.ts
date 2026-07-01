import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件位置：优先用环境变量（部署时指向持久卷），本地默认项目根目录 data.db
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, "../../../data.db");
// 确保数据库目录存在（持久卷首次挂载可能为空）
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

export const db = new Database(dbPath);

// 开启 WAL 提升并发读
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      company TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS device_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      model TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'online',
      specs_json TEXT,
      image_url TEXT,
      FOREIGN KEY (category_id) REFERENCES device_categories(id)
    );

    CREATE TABLE IF NOT EXISTS faults (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      symptom TEXT,
      cause TEXT,
      severity TEXT DEFAULT 'medium',
      frequency INTEGER DEFAULT 0,
      solution_json TEXT,
      related_ids_json TEXT,
      FOREIGN KEY (category_id) REFERENCES device_categories(id)
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      category_id TEXT,
      device_id TEXT,
      type TEXT,
      title TEXT,
      description TEXT,
      problem_category TEXT,
      severity TEXT,
      status TEXT DEFAULT 'pending',
      reply TEXT,
      images_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS device_bindings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      device_id TEXT,
      nickname TEXT,
      bound_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_devices_category ON devices(category_id);
    CREATE INDEX IF NOT EXISTS idx_faults_category ON faults(category_id);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks(category_id);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_type ON feedbacks(type);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
  `);
}
