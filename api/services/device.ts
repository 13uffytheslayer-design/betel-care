// 设备相关服务
import { db } from "../db/database";
import type { Device, DeviceCategory, DeviceDetail, Fault } from "@shared/types";

export function listCategories(): DeviceCategory[] {
  const stmt = db.prepare(`
    SELECT c.id, c.name, c.icon, c.description,
           COUNT(d.id) AS device_count,
           SUM(CASE WHEN d.status = 'online' THEN 1 ELSE 0 END) AS online_count
    FROM device_categories c
    LEFT JOIN devices d ON d.category_id = c.id
    GROUP BY c.id
    ORDER BY c.id
  `);
  const rows = stmt.all() as Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    device_count: number;
    online_count: number;
  }>;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    description: r.description,
    deviceCount: r.device_count,
    onlineCount: r.online_count,
  }));
}

export function listDevices(categoryId?: string): Device[] {
  let sql = `
    SELECT d.id, d.category_id, d.model, d.name, d.status, d.specs_json, d.image_url,
           COUNT(f.id) AS fault_count
    FROM devices d
    LEFT JOIN faults f ON f.category_id = d.category_id
  `;
  if (categoryId) sql += " WHERE d.category_id = ?";
  sql += " GROUP BY d.id ORDER BY d.category_id, d.model";
  const stmt = categoryId ? db.prepare(sql) : db.prepare(sql);
  const rows = (categoryId
    ? stmt.all(categoryId)
    : stmt.all()) as Array<{
    id: string;
    category_id: string;
    model: string;
    name: string;
    status: string;
    specs_json: string;
    image_url: string | null;
    fault_count: number;
  }>;
  return rows.map((r) => ({
    id: r.id,
    categoryId: r.category_id,
    model: r.model,
    name: r.name,
    status: r.status as Device["status"],
    specs: r.specs_json ? JSON.parse(r.specs_json) : [],
    imageUrl: r.image_url || undefined,
    commonFaultCount: r.fault_count,
  }));
}

export function getDevice(deviceId: string): DeviceDetail | null {
  const row = db
    .prepare(
      `SELECT d.id, d.category_id, d.model, d.name, d.status, d.specs_json, d.image_url,
              COUNT(f.id) AS fault_count
       FROM devices d
       LEFT JOIN faults f ON f.category_id = d.category_id
       WHERE d.id = ?
       GROUP BY d.id`,
    )
    .get(deviceId) as
    | {
        id: string;
        category_id: string;
        model: string;
        name: string;
        status: string;
        specs_json: string;
        image_url: string | null;
        fault_count: number;
      }
    | undefined;
  if (!row) return null;

  const faultRows = db
    .prepare(
      "SELECT id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json FROM faults WHERE category_id = ?",
    )
    .all(row.category_id) as FaultRow[];

  return {
    id: row.id,
    categoryId: row.category_id,
    model: row.model,
    name: row.name,
    status: row.status as Device["status"],
    specs: row.specs_json ? JSON.parse(row.specs_json) : [],
    imageUrl: row.image_url || undefined,
    commonFaultCount: row.fault_count,
    relatedFaults: faultRows.map(mapFault),
  };
}

interface FaultRow {
  id: string;
  category_id: string;
  title: string;
  symptom: string;
  cause: string;
  severity: string;
  frequency: number;
  solution_json: string;
  related_ids_json: string;
}

function mapFault(r: FaultRow): Fault {
  return {
    id: r.id,
    categoryId: r.category_id,
    title: r.title,
    symptom: r.symptom,
    cause: r.cause,
    severity: r.severity as Fault["severity"],
    frequency: r.frequency,
    solution: r.solution_json ? JSON.parse(r.solution_json) : { steps: [], cautions: [] },
    relatedFaultIds: r.related_ids_json ? JSON.parse(r.related_ids_json) : [],
  };
}

export function listFaultsByCategory(categoryId: string): Fault[] {
  const rows = db
    .prepare(
      "SELECT id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json FROM faults WHERE category_id = ? ORDER BY frequency DESC",
    )
    .all(categoryId) as FaultRow[];
  return rows.map(mapFault);
}

export function getFault(faultId: string): Fault | null {
  const row = db
    .prepare(
      "SELECT id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json FROM faults WHERE id = ?",
    )
    .get(faultId) as FaultRow | undefined;
  return row ? mapFault(row) : null;
}

export function searchFaults(
  categoryId?: string,
  severity?: string,
  keyword?: string,
  sort: "frequency" | "severity" = "frequency",
): Fault[] {
  let sql =
    "SELECT id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json FROM faults WHERE 1=1";
  const params: (string | number)[] = [];
  if (categoryId) {
    sql += " AND category_id = ?";
    params.push(categoryId);
  }
  if (severity) {
    sql += " AND severity = ?";
    params.push(severity);
  }
  if (keyword) {
    sql += " AND (title LIKE ? OR symptom LIKE ? OR cause LIKE ?)";
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw);
  }
  sql += sort === "frequency" ? " ORDER BY frequency DESC, title ASC" : " ORDER BY severity DESC, frequency DESC";
  const rows = db.prepare(sql).all(...params) as FaultRow[];
  return rows.map(mapFault);
}

export function getCategoryById(id: string): { id: string; name: string; icon: string } | null {
  const row = db.prepare("SELECT id, name, icon FROM device_categories WHERE id = ?").get(id) as
    | { id: string; name: string; icon: string }
    | undefined;
  return row || null;
}

export function getDashboardStats() {
  const totalDevices = (db.prepare("SELECT COUNT(*) as c FROM devices").get() as { c: number }).c;
  const onlineDevices = (db.prepare("SELECT COUNT(*) as c FROM devices WHERE status = 'online'").get() as { c: number }).c;
  const knowledgeCount = (db.prepare("SELECT COUNT(*) as c FROM faults").get() as { c: number }).c;
  const feedbackCount = (db.prepare("SELECT COUNT(*) as c FROM feedbacks").get() as { c: number }).c;
  return {
    onlineDevices,
    totalDevices,
    monthlyResolved: 128, // 模拟
    avgResponseMin: 4.6, // 模拟
    knowledgeCount,
    feedbackCount,
  };
}
