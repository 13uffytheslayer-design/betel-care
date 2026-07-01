import { Router } from "express";
import { getFault, searchFaults } from "../services/device";
import { requireAdmin, type AuthedRequest } from "../services/auth";
import {
  createFault,
  deleteFault,
  listAllFaults,
  updateFault,
} from "../services/admin";
import type { FaultSolution, Severity } from "@shared/types";

const router = Router();

// 故障检索（公开）
router.get("/", (req, res) => {
  const categoryId =
    typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
  const severity =
    typeof req.query.severity === "string" ? req.query.severity : undefined;
  const keyword =
    typeof req.query.keyword === "string" ? req.query.keyword : undefined;
  const sort =
    typeof req.query.sort === "string" && req.query.sort === "severity"
      ? "severity"
      : "frequency";
  res.json({
    success: true,
    data: searchFaults(categoryId, severity, keyword, sort),
  });
});

// 故障详情（公开）
router.get("/all", (_req, res) => {
  res.json({ success: true, data: listAllFaults() });
});

// 故障详情（公开）
router.get("/:id", (req, res) => {
  const fault = getFault(req.params.id);
  if (!fault) {
    res.status(404).json({ success: false, error: "故障不存在" });
    return;
  }
  res.json({ success: true, data: fault });
});

// ===== 管理员：故障知识库 CRUD =====

// 新增故障
router.post("/", requireAdmin, (req: AuthedRequest, res) => {
  const { categoryId, title, symptom, cause, severity, frequency, solution, relatedFaultIds } =
    req.body || {};
  if (!categoryId || !title || !symptom || !cause) {
    res.status(400).json({ success: false, error: "板块、标题、现象、原因为必填" });
    return;
  }
  const validSev: Severity[] = ["low", "medium", "high", "critical"];
  const sev: Severity = validSev.includes(severity) ? severity : "medium";
  const sol: FaultSolution =
    solution && typeof solution === "object"
      ? solution
      : { steps: [], cautions: [] };
  const fault = createFault({
    categoryId,
    title,
    symptom,
    cause,
    severity: sev,
    frequency: typeof frequency === "number" ? frequency : 0,
    solution: sol,
    relatedFaultIds: Array.isArray(relatedFaultIds) ? relatedFaultIds : [],
  });
  res.json({ success: true, data: fault });
});

// 更新故障（含解决方案更新）
router.put("/:id", requireAdmin, (req: AuthedRequest, res) => {
  const { categoryId, title, symptom, cause, severity, frequency, solution, relatedFaultIds } =
    req.body || {};
  const validSev: Severity[] = ["low", "medium", "high", "critical"];
  const updated = updateFault(req.params.id, {
    categoryId,
    title,
    symptom,
    cause,
    severity: severity && validSev.includes(severity) ? severity : undefined,
    frequency: typeof frequency === "number" ? frequency : undefined,
    solution: solution && typeof solution === "object" ? solution : undefined,
    relatedFaultIds: Array.isArray(relatedFaultIds) ? relatedFaultIds : undefined,
  });
  if (!updated) {
    res.status(404).json({ success: false, error: "故障不存在" });
    return;
  }
  res.json({ success: true, data: updated });
});

// 删除故障
router.delete("/:id", requireAdmin, (req: AuthedRequest, res) => {
  const ok = deleteFault(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: "故障不存在" });
    return;
  }
  res.json({ success: true, data: { id: req.params.id } });
});

export default router;
