// 设备与板块管理：板块 CRUD + 设备 CRUD
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Cpu,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import { StatusDot } from "@/components/Status";
import { adminApi, deviceApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { cn, statusConfig } from "@/lib/utils";
import type { Device, DeviceCategory } from "@shared/types";

type Tab = "devices" | "categories";

export default function AdminDevices() {
  const [tab, setTab] = useState<Tab>("devices");
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([
        adminApi.listAllDevices(),
        deviceApi.categories(),
      ]);
      setDevices(d);
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

  return (
    <AdminShell title="设备与板块管理" subtitle="ADMIN · 设备维护 · 板块扩展">
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

      {/* Tab */}
      <div className="flex items-center gap-2 mb-5">
        {(
          [
            { id: "devices" as Tab, label: "设备列表", icon: Cpu },
            { id: "categories" as Tab, label: "设备板块", icon: Layers },
          ]
        ).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium clip-corner-sm border transition-all",
                active
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                  : "border-ink-700 text-slate-400 hover:text-slate-200",
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : tab === "devices" ? (
        <DevicesTab
          devices={devices}
          categories={categories}
          onChanged={load}
          onError={setError}
        />
      ) : (
        <CategoriesTab categories={categories} onChanged={load} onError={setError} />
      )}
    </AdminShell>
  );
}

// ===== 设备列表 Tab =====
function DevicesTab({
  devices,
  categories,
  onChanged,
  onError,
}: {
  devices: Device[];
  categories: DeviceCategory[];
  onChanged: () => void;
  onError: (m: string) => void;
}) {
  const [editing, setEditing] = useState<Partial<Device> | null>(null);

  async function handleDelete(d: Device) {
    if (!confirm(`确认删除设备「${d.name}」？`)) return;
    try {
      await adminApi.deleteDevice(d.id);
      onChanged();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "删除失败");
    }
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.categoryId || !editing.model || !editing.name) {
      onError("板块、型号、名称为必填");
      return;
    }
    try {
      if (editing.id) {
        await adminApi.updateDevice(editing.id, editing);
      } else {
        await adminApi.createDevice({
          categoryId: editing.categoryId!,
          model: editing.model!,
          name: editing.name!,
          status: editing.status,
          specs: editing.specs,
        });
      }
      setEditing(null);
      onChanged();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "保存失败");
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() =>
            setEditing({ categoryId: categories[0]?.id ?? "", status: "online", specs: [] })
          }
          className="btn-primary !py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          新增设备
        </button>
      </div>
      {devices.length === 0 ? (
        <HudCard className="p-10 text-center text-slate-500 text-sm">暂无设备</HudCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {devices.map((d) => {
            const cat = categories.find((c) => c.id === d.categoryId);
            return (
              <HudCard key={d.id} className="p-4" glow={false}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusDot status={d.status} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {d.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500">{d.model}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditing({ ...d })}
                      className="p-1.5 text-slate-400 hover:text-cyan-300"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(d)}
                      className="p-1.5 text-slate-400 hover:text-crimson-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  板块：{cat?.name || d.categoryId}
                </p>
              </HudCard>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <DeviceEditor
            form={editing}
            categories={categories}
            onChange={setEditing}
            onSave={handleSave}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DeviceEditor({
  form,
  categories,
  onChange,
  onSave,
  onClose,
}: {
  form: Partial<Device>;
  categories: DeviceCategory[];
  onChange: (f: Partial<Device>) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  function update(patch: Partial<Device>) {
    onChange({ ...form, ...patch });
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
        className="w-full max-w-md bg-ink-950 border-l border-ink-700 overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-ink-950/95 backdrop-blur border-b border-ink-700">
          <h2 className="font-display text-lg font-bold text-slate-100">
            {form.id ? "编辑设备" : "新增设备"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="设备板块">
            <select
              value={form.categoryId ?? ""}
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
          </Field>
          <Field label="设备名称">
            <input
              value={form.name ?? ""}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="如：BX-2000 高速选籽机"
              className="input"
            />
          </Field>
          <Field label="型号">
            <input
              value={form.model ?? ""}
              onChange={(e) => update({ model: e.target.value })}
              placeholder="如：BX-2000"
              className="input"
            />
          </Field>
          <Field label="运行状态">
            <select
              value={form.status ?? "online"}
              onChange={(e) =>
                update({ status: e.target.value as Device["status"] })
              }
              className="input"
            >
              <option value="online">在线</option>
              <option value="warning">告警</option>
              <option value="offline">离线</option>
            </select>
          </Field>
        </div>
        <div className="sticky bottom-0 flex gap-2 px-5 py-4 bg-ink-950/95 backdrop-blur border-t border-ink-700">
          <button onClick={onClose} className="btn-ghost flex-1 !py-2.5 text-sm">
            取消
          </button>
          <button onClick={onSave} className="btn-primary flex-1 !py-2.5 text-sm">
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== 板块列表 Tab =====
function CategoriesTab({
  categories,
  onChanged,
  onError,
}: {
  categories: DeviceCategory[];
  onChanged: () => void;
  onError: (m: string) => void;
}) {
  const [editing, setEditing] = useState<
    | { id?: string; name: string; icon: string; description: string; isNew: boolean }
    | null
  >(null);

  async function handleDelete(c: DeviceCategory) {
    if (c.deviceCount > 0) {
      onError(`板块「${c.name}」仍含 ${c.deviceCount} 台设备，无法删除`);
      return;
    }
    if (!confirm(`确认删除板块「${c.name}」？`)) return;
    try {
      await adminApi.deleteCategory(c.id);
      onChanged();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "删除失败");
    }
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.name || (editing.isNew && !editing.id)) {
      onError("板块ID和名称为必填");
      return;
    }
    try {
      if (editing.isNew) {
        await adminApi.createCategory({
          id: editing.id!,
          name: editing.name,
          icon: editing.icon || "Cpu",
          description: editing.description,
        });
      } else {
        await adminApi.updateCategory(editing.id!, {
          name: editing.name,
          icon: editing.icon,
          description: editing.description,
        });
      }
      setEditing(null);
      onChanged();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "保存失败");
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() =>
            setEditing({ name: "", icon: "Cpu", description: "", isNew: true })
          }
          className="btn-primary !py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          新增板块
        </button>
      </div>
      {categories.length === 0 ? (
        <HudCard className="p-10 text-center text-slate-500 text-sm">暂无板块</HudCard>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <HudCard key={c.id} className="p-4" glow={false}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 grid place-items-center clip-corner-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Layers className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{c.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">/{c.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {c.description || "无描述"}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    设备 {c.deviceCount} · 在线 {c.onlineCount}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setEditing({
                        id: c.id,
                        name: c.name,
                        icon: c.icon,
                        description: c.description,
                        isNew: false,
                      })
                    }
                    className="p-1.5 text-slate-400 hover:text-cyan-300"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 text-slate-400 hover:text-crimson-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </HudCard>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-ink-950 border border-ink-700 clip-corner-lg"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700">
                <h2 className="font-display text-lg font-bold text-slate-100">
                  {editing.isNew ? "新增板块" : "编辑板块"}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {editing.isNew && (
                  <Field label="板块ID（英文短标识，如 sheet-sorter）">
                    <input
                      value={editing.id ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, id: e.target.value })
                      }
                      placeholder="如：seed-cleaner"
                      className="input"
                    />
                  </Field>
                )}
                <Field label="板块名称">
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    placeholder="如：槟榔智能清洗机"
                    className="input"
                  />
                </Field>
                <Field label="图标（lucide 图标名）">
                  <input
                    value={editing.icon}
                    onChange={(e) =>
                      setEditing({ ...editing, icon: e.target.value })
                    }
                    placeholder="Cpu / ScanLine / Layers / Scissors"
                    className="input"
                  />
                </Field>
                <Field label="描述">
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                    placeholder="板块简介..."
                    className="input resize-none"
                  />
                </Field>
              </div>
              <div className="flex gap-2 px-5 py-4 border-t border-ink-700">
                <button
                  onClick={() => setEditing(null)}
                  className="btn-ghost flex-1 !py-2.5 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex-1 !py-2.5 text-sm"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
