// 故障知识库管理：列表 + 新增/编辑（含处理步骤、注意事项编辑器）+ 删除
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import { SeverityTag } from "@/components/Status";
import { adminApi, deviceApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { categoryLabel, cn } from "@/lib/utils";
import type { DeviceCategory, Fault, Severity } from "@shared/types";

interface StepInput {
  order: number;
  title: string;
  detail: string;
}

interface FormState {
  id?: string;
  categoryId: string;
  title: string;
  symptom: string;
  cause: string;
  severity: Severity;
  frequency: number;
  steps: StepInput[];
  cautions: string[];
}

const EMPTY_FORM: FormState = {
  categoryId: "",
  title: "",
  symptom: "",
  cause: "",
  severity: "medium",
  frequency: 0,
  steps: [{ order: 1, title: "", detail: "" }],
  cautions: [""],
};

export default function AdminFaults() {
  const [faults, setFaults] = useState<Fault[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [f, c] = await Promise.all([adminApi.listFaults(), deviceApi.categories()]);
      setFaults(f);
      setCategories(c);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return faults.filter((f) => {
      if (filterCat && f.categoryId !== filterCat) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        return (
          f.title.toLowerCase().includes(kw) ||
          f.symptom.toLowerCase().includes(kw) ||
          f.cause.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }, [faults, keyword, filterCat]);

  function startCreate() {
    setError(null);
    setEditing({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id ?? "",
    });
  }

  function startEdit(f: Fault) {
    setError(null);
    setEditing({
      id: f.id,
      categoryId: f.categoryId,
      title: f.title,
      symptom: f.symptom,
      cause: f.cause,
      severity: f.severity,
      frequency: f.frequency,
      steps:
        f.solution.steps.length > 0
          ? f.solution.steps.map((s) => ({
              order: s.order,
              title: s.title,
              detail: s.detail,
            }))
          : [{ order: 1, title: "", detail: "" }],
      cautions:
        f.solution.cautions.length > 0 ? [...f.solution.cautions] : [""],
    });
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.categoryId || !editing.title || !editing.symptom || !editing.cause) {
      setError("板块、标题、现象、原因为必填");
      return;
    }
    const cleanSteps = editing.steps
      .filter((s) => s.title.trim() || s.detail.trim())
      .map((s, i) => ({ order: i + 1, title: s.title.trim(), detail: s.detail.trim() }));
    const cleanCautions = editing.cautions
      .map((c) => c.trim())
      .filter(Boolean);
    const payload = {
      categoryId: editing.categoryId,
      title: editing.title.trim(),
      symptom: editing.symptom.trim(),
      cause: editing.cause.trim(),
      severity: editing.severity,
      frequency: editing.frequency,
      solution: { steps: cleanSteps, cautions: cleanCautions },
    };
    setSaving(true);
    setError(null);
    try {
      if (editing.id) {
        await adminApi.updateFault(editing.id, payload);
      } else {
        await adminApi.createFault(payload);
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(f: Fault) {
    if (!confirm(`确认删除故障「${f.title}」？此操作不可恢复。`)) return;
    try {
      await adminApi.deleteFault(f.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "删除失败");
    }
  }

  return (
    <AdminShell title="故障知识库管理" subtitle="ADMIN · 解决方案维护 · 智能客服知识源">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-start gap-2 px-3 py-2 bg-crimson-500/10 border border-crimson-500/40 text-crimson-300 text-xs clip-corner-sm"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索故障标题/现象/原因..."
            className="w-full pl-9 pr-3 py-2 bg-ink-900/60 border border-ink-600 text-slate-100 text-sm placeholder:text-slate-600 clip-corner-sm outline-none focus:border-cyan-500/70"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 bg-ink-900/60 border border-ink-600 text-slate-200 text-sm clip-corner-sm outline-none focus:border-cyan-500/70"
        >
          <option value="">全部板块</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={startCreate} className="btn-primary !py-2 text-sm shrink-0">
          <Plus className="w-4 h-4" />
          新增故障
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <HudCard className="p-10 text-center text-slate-500 text-sm">
              暂无故障条目
            </HudCard>
          ) : (
            filtered.map((f) => (
              <FaultRow
                key={f.id}
                fault={f}
                onEdit={() => startEdit(f)}
                onDelete={() => handleDelete(f)}
              />
            ))
          )}
        </div>
      )}

      {/* 编辑抽屉 */}
      <AnimatePresence>
        {editing && (
          <FaultEditor
            form={editing}
            categories={categories}
            saving={saving}
            onChange={setEditing}
            onSave={handleSave}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

function FaultRow({
  fault,
  onEdit,
  onDelete,
}: {
  fault: Fault;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <HudCard className="overflow-hidden" glow={false}>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-slate-500 hover:text-cyan-300 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip">{categoryLabel[fault.categoryId] || fault.categoryId}</span>
            <SeverityTag severity={fault.severity} />
            <span className="text-[10px] font-mono text-slate-500">
              频次 {fault.frequency}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-100 mt-1 truncate">
            {fault.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-cyan-300 transition-colors"
            title="编辑"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-crimson-400 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-ink-700/60">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              故障现象
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{fault.symptom}</p>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              可能原因
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{fault.cause}</p>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              处理步骤（{fault.solution.steps.length}）
            </div>
            <ol className="space-y-1.5">
              {fault.solution.steps.map((s) => (
                <li key={s.order} className="flex gap-2 text-xs text-slate-300">
                  <span className="num text-cyan-400 shrink-0">{s.order}.</span>
                  <div>
                    <span className="font-medium text-slate-200">{s.title}</span>
                    {s.detail && (
                      <span className="text-slate-400"> — {s.detail}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {fault.solution.cautions.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                注意事项
              </div>
              <ul className="space-y-1">
                {fault.solution.cautions.map((c, i) => (
                  <li key={i} className="flex gap-2 text-xs text-amber-200/80">
                    <span className="shrink-0">⚠</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </HudCard>
  );
}

function FaultEditor({
  form,
  categories,
  saving,
  onChange,
  onSave,
  onClose,
}: {
  form: FormState;
  categories: DeviceCategory[];
  saving: boolean;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  function update(patch: Partial<FormState>) {
    onChange({ ...form, ...patch });
  }
  function updateStep(i: number, patch: Partial<StepInput>) {
    const steps = [...form.steps];
    steps[i] = { ...steps[i], ...patch };
    update({ steps });
  }
  function addStep() {
    update({
      steps: [...form.steps, { order: form.steps.length + 1, title: "", detail: "" }],
    });
  }
  function removeStep(i: number) {
    update({ steps: form.steps.filter((_, idx) => idx !== i) });
  }
  function updateCaution(i: number, v: string) {
    const cautions = [...form.cautions];
    cautions[i] = v;
    update({ cautions });
  }
  function addCaution() {
    update({ cautions: [...form.cautions, ""] });
  }
  function removeCaution(i: number) {
    update({ cautions: form.cautions.filter((_, idx) => idx !== i) });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ type: "tween", duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-ink-950 border-l border-ink-700 overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-ink-950/95 backdrop-blur border-b border-ink-700">
          <h2 className="font-display text-lg font-bold text-slate-100">
            {form.id ? "编辑故障" : "新增故障"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <FormField label="设备板块">
            <select
              value={form.categoryId}
              onChange={(e) => update({ categoryId: e.target.value })}
              className="input"
            >
              <option value="">请选择板块</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="故障标题">
            <input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="如：剔除阀不动作/漏剔除"
              className="input"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="严重度">
              <select
                value={form.severity}
                onChange={(e) => update({ severity: e.target.value as Severity })}
                className="input"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="critical">紧急</option>
              </select>
            </FormField>
            <FormField label="出现频次">
              <input
                type="number"
                min={0}
                value={form.frequency}
                onChange={(e) =>
                  update({ frequency: parseInt(e.target.value, 10) || 0 })
                }
                className="input"
              />
            </FormField>
          </div>

          <FormField label="故障现象">
            <textarea
              value={form.symptom}
              onChange={(e) => update({ symptom: e.target.value })}
              rows={3}
              placeholder="描述故障的具体表现..."
              className="input resize-none"
            />
          </FormField>

          <FormField label="可能原因">
            <textarea
              value={form.cause}
              onChange={(e) => update({ cause: e.target.value })}
              rows={3}
              placeholder="描述导致故障的可能原因..."
              className="input resize-none"
            />
          </FormField>

          {/* 处理步骤编辑器 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                处理步骤
              </label>
              <button
                onClick={addStep}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> 添加步骤
              </button>
            </div>
            <div className="space-y-2">
              {form.steps.map((s, i) => (
                <div
                  key={i}
                  className="flex gap-2 p-2 bg-ink-900/60 border border-ink-700 clip-corner-sm"
                >
                  <span className="num text-cyan-400 text-sm font-bold w-5 text-center shrink-0 pt-2">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={s.title}
                      onChange={(e) => updateStep(i, { title: e.target.value })}
                      placeholder="步骤标题"
                      className="input !py-1.5 text-xs"
                    />
                    <input
                      value={s.detail}
                      onChange={(e) => updateStep(i, { detail: e.target.value })}
                      placeholder="详细说明（可选）"
                      className="input !py-1.5 text-xs"
                    />
                  </div>
                  {form.steps.length > 1 && (
                    <button
                      onClick={() => removeStep(i)}
                      className="p-1 text-slate-500 hover:text-crimson-400 self-start"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 注意事项编辑器 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                注意事项
              </label>
              <button
                onClick={addCaution}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> 添加
              </button>
            </div>
            <div className="space-y-2">
              {form.cautions.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-amber-400 text-sm shrink-0 pt-2">⚠</span>
                  <input
                    value={c}
                    onChange={(e) => updateCaution(i, e.target.value)}
                    placeholder="注意事项内容"
                    className="input !py-1.5 text-xs"
                  />
                  {form.cautions.length > 1 && (
                    <button
                      onClick={() => removeCaution(i)}
                      className="p-1 text-slate-500 hover:text-crimson-400 self-start"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-2 px-5 py-4 bg-ink-950/95 backdrop-blur border-t border-ink-700">
          <button onClick={onClose} className="btn-ghost flex-1 !py-2.5 text-sm">
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="btn-primary flex-1 !py-2.5 text-sm disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
