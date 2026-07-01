import { Router } from "express";
import { authMiddleware, requireAdmin, softAuth, type AuthedRequest } from "../services/auth";
import {
  createFeedback,
  getFeedbackStats,
  listAllFeedbacks,
  listUserFeedbacks,
  replyFeedback,
  updateFeedbackStatus,
} from "../services/feedback";
import { previewClassify } from "../services/classifier";
import type { FeedbackType } from "@shared/types";

const router = Router();

// 提交反馈（登录用户归属其账号，匿名也允许）
router.post("/", softAuth, (req: AuthedRequest, res) => {
  const { categoryId, deviceId, type, title, description, images } = req.body || {};
  if (!categoryId || !type || !title || !description) {
    res.status(400).json({ success: false, error: "设备板块、类型、标题、描述为必填" });
    return;
  }
  if (type !== "exception" && type !== "suggestion") {
    res.status(400).json({ success: false, error: "类型必须为 exception 或 suggestion" });
    return;
  }
  const userId = req.userId ?? null;
  const fb = createFeedback({
    userId,
    categoryId,
    deviceId: typeof deviceId === "string" ? deviceId : undefined,
    type: type as FeedbackType,
    title,
    description,
    images: Array.isArray(images) ? images : undefined,
  });
  res.json({ success: true, data: fb });
});

// 预览分类（表单实时调用，公开）
router.post("/preview-classify", (req, res) => {
  const { text, categoryId } = req.body || {};
  if (!text || !categoryId) {
    res.status(400).json({ success: false, error: "text 和 categoryId 为必填" });
    return;
  }
  res.json({ success: true, data: previewClassify(String(text), String(categoryId)) });
});

// 我的反馈（需登录）
router.get("/mine", authMiddleware, (req: AuthedRequest, res) => {
  res.json({ success: true, data: listUserFeedbacks(req.userId!) });
});

// ===== 以下为管理员专属：反馈分类统计与全部反馈 =====

// 统计看板（管理员）
router.get("/stats", requireAdmin, (_req: AuthedRequest, res) => {
  res.json({ success: true, data: getFeedbackStats() });
});

// 全部反馈（管理员视角）
router.get("/", requireAdmin, (_req: AuthedRequest, res) => {
  res.json({ success: true, data: listAllFeedbacks() });
});

// 回复反馈（管理员）
router.post("/:id/reply", requireAdmin, (req: AuthedRequest, res) => {
  const { reply } = req.body || {};
  if (!reply) {
    res.status(400).json({ success: false, error: "回复内容为必填" });
    return;
  }
  const ok = replyFeedback(req.params.id, String(reply));
  if (!ok) {
    res.status(404).json({ success: false, error: "反馈不存在" });
    return;
  }
  res.json({ success: true, data: { id: req.params.id, status: "resolved" } });
});

// 更新反馈状态（管理员）
router.put("/:id/status", requireAdmin, (req: AuthedRequest, res) => {
  const { status } = req.body || {};
  const valid = ["pending", "processing", "resolved"];
  if (!status || !valid.includes(status)) {
    res.status(400).json({ success: false, error: "状态必须为 pending/processing/resolved" });
    return;
  }
  const ok = updateFeedbackStatus(req.params.id, String(status));
  if (!ok) {
    res.status(404).json({ success: false, error: "反馈不存在" });
    return;
  }
  res.json({ success: true, data: { id: req.params.id, status } });
});

export default router;
