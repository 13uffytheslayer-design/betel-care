import { Router } from "express";
import {
  getDashboardStats,
  getDevice,
  listCategories,
  listDevices,
} from "../services/device";
import { requireAdmin, type AuthedRequest } from "../services/auth";
import {
  createCategory,
  createDevice,
  deleteCategory,
  deleteDevice,
  listAllDevices,
  updateCategory,
  updateDevice,
} from "../services/admin";
import type { Device } from "@shared/types";

const router = Router();

// 板块列表（公开）
router.get("/categories", (_req, res) => {
  res.json({ success: true, data: listCategories() });
});

// 设备列表（公开）
router.get("/", (req, res) => {
  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
  res.json({ success: true, data: listDevices(categoryId) });
});

// 看板统计（公开）
router.get("/stats/dashboard", (_req, res) => {
  res.json({ success: true, data: getDashboardStats() });
});

// ===== 管理员：设备 CRUD =====
// 注意：静态路径须在 /:id 之前定义，避免被 :id 捕获

// 全部设备（管理视角，扁平列表）
router.get("/admin/all", requireAdmin, (_req: AuthedRequest, res) => {
  res.json({ success: true, data: listAllDevices() });
});

// 设备详情（公开）—— 放在 /admin/all 之后
router.get("/:id", (req, res) => {
  const detail = getDevice(req.params.id);
  if (!detail) {
    res.status(404).json({ success: false, error: "设备不存在" });
    return;
  }
  res.json({ success: true, data: detail });
});

router.post("/", requireAdmin, (req: AuthedRequest, res) => {
  const { categoryId, model, name, status, specs, imageUrl } = req.body || {};
  if (!categoryId || !model || !name) {
    res.status(400).json({ success: false, error: "板块、型号、名称为必填" });
    return;
  }
  const validStatus: Device["status"][] = ["online", "warning", "offline"];
  const dev = createDevice({
    categoryId,
    model,
    name,
    status: validStatus.includes(status) ? status : "online",
    specs: Array.isArray(specs) ? specs : [],
    imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
  });
  res.json({ success: true, data: dev });
});

router.put("/:id", requireAdmin, (req: AuthedRequest, res) => {
  const { categoryId, model, name, status, specs, imageUrl } = req.body || {};
  const validStatus: Device["status"][] = ["online", "warning", "offline"];
  const updated = updateDevice(req.params.id, {
    categoryId,
    model,
    name,
    status: validStatus.includes(status) ? status : undefined,
    specs: Array.isArray(specs) ? specs : undefined,
    imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
  });
  if (!updated) {
    res.status(404).json({ success: false, error: "设备不存在" });
    return;
  }
  res.json({ success: true, data: updated });
});

router.delete("/:id", requireAdmin, (req: AuthedRequest, res) => {
  const ok = deleteDevice(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: "设备不存在" });
    return;
  }
  res.json({ success: true, data: { id: req.params.id } });
});

// ===== 管理员：设备板块 CRUD =====

router.post("/categories", requireAdmin, (req: AuthedRequest, res) => {
  const { id, name, icon, description } = req.body || {};
  if (!id || !name) {
    res.status(400).json({ success: false, error: "板块ID和名称为必填" });
    return;
  }
  try {
    const cat = createCategory({
      id,
      name,
      icon: typeof icon === "string" ? icon : undefined,
      description: typeof description === "string" ? description : undefined,
    });
    res.json({ success: true, data: cat });
  } catch {
    res.status(409).json({ success: false, error: "板块ID已存在" });
    return;
  }
});

router.put("/categories/:id", requireAdmin, (req: AuthedRequest, res) => {
  const { name, icon, description } = req.body || {};
  const updated = updateCategory(req.params.id, {
    name: typeof name === "string" ? name : undefined,
    icon: typeof icon === "string" ? icon : undefined,
    description: typeof description === "string" ? description : undefined,
  });
  if (!updated) {
    res.status(404).json({ success: false, error: "板块不存在" });
    return;
  }
  res.json({ success: true, data: updated });
});

router.delete("/categories/:id", requireAdmin, (req: AuthedRequest, res) => {
  const ok = deleteCategory(req.params.id);
  if (!ok) {
    res.status(400).json({
      success: false,
      error: "板块不存在或仍包含设备，无法删除",
    });
    return;
  }
  res.json({ success: true, data: { id: req.params.id } });
});

export default router;
