// 管理员服务：故障知识库 / 设备 / 板块 的增删改
import { db } from "../db/database";
import type {
  Device,
  DeviceCategory,
  Fault,
  FaultSolution,
  Severity,
} from "@shared/types";

// ===== 故障知识库 CRUD =====

interface FaultInput {
  id?: string;
  categoryId: string;
  title: string;
  symptom: string;
  cause: string;
  severity: Severity;
  frequency?: number;
  solution: FaultSolution;
  relatedFaultIds?: string[];
}

function genFaultId(): string {
  return "flt-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function createFault(input: FaultInput): Fault {
  const id = input.id || genFaultId();
  db.prepare(
    `INSERT INTO faults (id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.categoryId,
    input.title,
    input.symptom,
    input.cause,
    input.severity,
    input.frequency ?? 0,
    JSON.stringify(input.solution),
    JSON.stringify(input.relatedFaultIds ?? []),
  );
  return getFaultById(id)!;
}

export function updateFault(id: string, input: Partial<FaultInput>): Fault | null {
  const exists = getFaultById(id);
  if (!exists) return null;
  const fields: string[] = [];
  const params: (string | number)[] = [];
  if (input.categoryId !== undefined) {
    fields.push("category_id = ?");
    params.push(input.categoryId);
  }
  if (input.title !== undefined) {
    fields.push("title = ?");
    params.push(input.title);
  }
  if (input.symptom !== undefined) {
    fields.push("symptom = ?");
    params.push(input.symptom);
  }
  if (input.cause !== undefined) {
    fields.push("cause = ?");
    params.push(input.cause);
  }
  if (input.severity !== undefined) {
    fields.push("severity = ?");
    params.push(input.severity);
  }
  if (input.frequency !== undefined) {
    fields.push("frequency = ?");
    params.push(input.frequency);
  }
  if (input.solution !== undefined) {
    fields.push("solution_json = ?");
    params.push(JSON.stringify(input.solution));
  }
  if (input.relatedFaultIds !== undefined) {
    fields.push("related_ids_json = ?");
    params.push(JSON.stringify(input.relatedFaultIds));
  }
  if (fields.length === 0) return exists;
  params.push(id);
  db.prepare(`UPDATE faults SET ${fields.join(", ")} WHERE id = ?`).run(...params);
  return getFaultById(id);
}

export function deleteFault(id: string): boolean {
  const result = db.prepare("DELETE FROM faults WHERE id = ?").run(id);
  return result.changes > 0;
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
    solution: r.solution_json
      ? JSON.parse(r.solution_json)
      : { steps: [], cautions: [] },
    relatedFaultIds: r.related_ids_json ? JSON.parse(r.related_ids_json) : [],
  };
}

export function getFaultById(id: string): Fault | null {
  const row = db
    .prepare(
      "SELECT id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json FROM faults WHERE id = ?",
    )
    .get(id) as FaultRow | undefined;
  return row ? mapFault(row) : null;
}

export function listAllFaults(): Fault[] {
  const rows = db
    .prepare(
      "SELECT id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json FROM faults ORDER BY category_id, frequency DESC",
    )
    .all() as FaultRow[];
  return rows.map(mapFault);
}

// ===== 设备 CRUD =====

interface DeviceInput {
  id?: string;
  categoryId: string;
  model: string;
  name: string;
  status?: Device["status"];
  specs?: Device["specs"];
  imageUrl?: string;
}

function genDeviceId(): string {
  return "dev-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

interface DeviceRow {
  id: string;
  category_id: string;
  model: string;
  name: string;
  status: string;
  specs_json: string;
  image_url: string | null;
}

export function createDevice(input: DeviceInput): Device {
  const id = input.id || genDeviceId();
  db.prepare(
    "INSERT INTO devices (id, category_id, model, name, status, specs_json, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(
    id,
    input.categoryId,
    input.model,
    input.name,
    input.status ?? "online",
    JSON.stringify(input.specs ?? []),
    input.imageUrl ?? null,
  );
  return getDeviceById(id)!;
}

export function updateDevice(
  id: string,
  input: Partial<DeviceInput>,
): Device | null {
  const exists = getDeviceById(id);
  if (!exists) return null;
  const fields: string[] = [];
  const params: (string | number)[] = [];
  if (input.categoryId !== undefined) {
    fields.push("category_id = ?");
    params.push(input.categoryId);
  }
  if (input.model !== undefined) {
    fields.push("model = ?");
    params.push(input.model);
  }
  if (input.name !== undefined) {
    fields.push("name = ?");
    params.push(input.name);
  }
  if (input.status !== undefined) {
    fields.push("status = ?");
    params.push(input.status);
  }
  if (input.specs !== undefined) {
    fields.push("specs_json = ?");
    params.push(JSON.stringify(input.specs));
  }
  if (input.imageUrl !== undefined) {
    fields.push("image_url = ?");
    params.push(input.imageUrl);
  }
  if (fields.length === 0) return exists;
  params.push(id);
  db.prepare(`UPDATE devices SET ${fields.join(", ")} WHERE id = ?`).run(...params);
  return getDeviceById(id);
}

export function deleteDevice(id: string): boolean {
  const result = db.prepare("DELETE FROM devices WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getDeviceById(id: string): Device | null {
  const row = db
    .prepare(
      "SELECT id, category_id, model, name, status, specs_json, image_url FROM devices WHERE id = ?",
    )
    .get(id) as DeviceRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    categoryId: row.category_id,
    model: row.model,
    name: row.name,
    status: row.status as Device["status"],
    specs: row.specs_json ? JSON.parse(row.specs_json) : [],
    imageUrl: row.image_url || undefined,
    commonFaultCount: 0,
  };
}

export function listAllDevices(): Device[] {
  const rows = db
    .prepare(
      "SELECT id, category_id, model, name, status, specs_json, image_url FROM devices ORDER BY category_id, model",
    )
    .all() as DeviceRow[];
  return rows.map((r) => ({
    id: r.id,
    categoryId: r.category_id,
    model: r.model,
    name: r.name,
    status: r.status as Device["status"],
    specs: r.specs_json ? JSON.parse(r.specs_json) : [],
    imageUrl: r.image_url || undefined,
    commonFaultCount: 0,
  }));
}

// ===== 设备板块 CRUD =====

interface CategoryInput {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export function createCategory(input: CategoryInput): DeviceCategory {
  db.prepare(
    "INSERT INTO device_categories (id, name, icon, description) VALUES (?, ?, ?, ?)",
  ).run(input.id, input.name, input.icon ?? "Cpu", input.description ?? "");
  return getCategoryByIdRow(input.id)!;
}

export function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): DeviceCategory | null {
  const exists = getCategoryByIdRow(id);
  if (!exists) return null;
  const fields: string[] = [];
  const params: string[] = [];
  if (input.name !== undefined) {
    fields.push("name = ?");
    params.push(input.name);
  }
  if (input.icon !== undefined) {
    fields.push("icon = ?");
    params.push(input.icon);
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    params.push(input.description);
  }
  if (fields.length === 0) return exists;
  params.push(id);
  db.prepare(`UPDATE device_categories SET ${fields.join(", ")} WHERE id = ?`).run(
    ...params,
  );
  return getCategoryByIdRow(id);
}

export function deleteCategory(id: string): boolean {
  // 禁止删除仍含设备/故障的板块
  const devCount = db
    .prepare("SELECT COUNT(*) as c FROM devices WHERE category_id = ?")
    .get(id) as { c: number };
  if (devCount.c > 0) return false;
  const result = db.prepare("DELETE FROM device_categories WHERE id = ?").run(id);
  return result.changes > 0;
}

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  description: string;
  device_count: number;
  online_count: number;
}

export function getCategoryByIdRow(id: string): DeviceCategory | null {
  const row = db
    .prepare(
      `SELECT c.id, c.name, c.icon, c.description,
              COUNT(d.id) AS device_count,
              SUM(CASE WHEN d.status = 'online' THEN 1 ELSE 0 END) AS online_count
       FROM device_categories c
       LEFT JOIN devices d ON d.category_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`,
    )
    .get(id) as CategoryRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    description: row.description,
    deviceCount: row.device_count,
    onlineCount: row.online_count,
  };
}
