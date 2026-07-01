// 故障知识库列表页
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, Search, SlidersHorizontal } from "lucide-react";
import PageShell from "@/components/PageShell";
import HudCard from "@/components/HudCard";
import { SeverityTag } from "@/components/Status";
import { faultApi } from "@/lib/api";
import { categoryLabel, cn } from "@/lib/utils";
import type { Fault } from "@shared/types";

const SEVERITY_OPTIONS = [
  { value: "", label: "全部严重度" },
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
  { value: "critical", label: "紧急" },
];

const SORT_OPTIONS = [
  { value: "frequency", label: "按频次" },
  { value: "severity", label: "按严重度" },
];

export default function Knowledge() {
  const [faults, setFaults] = useState<Fault[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [severity, setSeverity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<"frequency" | "severity">("frequency");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "", name: "全部设备" },
    { id: "seed-sorter", name: "槟榔选籽机" },
    { id: "sheet-sorter", name: "槟榔选片机" },
    { id: "seed-cutter", name: "槟榔切籽机" },
  ];

  useEffect(() => {
    setLoading(true);
    faultApi
      .list({ categoryId: categoryId || undefined, severity: severity || undefined, keyword: keyword || undefined, sort })
      .then(setFaults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryId, severity, keyword, sort]);

  const grouped = useMemo(() => {
    const map: Record<string, Fault[]> = {};
    for (const f of faults) {
      if (!map[f.categoryId]) map[f.categoryId] = [];
      map[f.categoryId].push(f);
    }
    return map;
  }, [faults]);

  return (
    <PageShell
      title="故障知识库"
      subtitle="FAULT KNOWLEDGE BASE · 常见故障与解决方案"
    >
      {/* 检索栏 */}
      <HudCard className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索故障标题、现象、原因..."
              className="w-full pl-9 pr-3 py-2.5 bg-ink-900 border border-ink-700 clip-corner-sm text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-2.5 bg-ink-900 border border-ink-700 clip-corner-sm text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="px-3 py-2.5 bg-ink-900 border border-ink-700 clip-corner-sm text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 px-2 bg-ink-900 border border-ink-700 clip-corner-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value as "frequency" | "severity")}
                  className={cn(
                    "px-2 py-2 text-xs transition-colors",
                    sort === s.value
                      ? "text-cyan-300"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>共 {faults.length} 条解决方案</span>
          {loading && <span className="text-cyan-400">加载中...</span>}
        </div>
      </HudCard>

      {/* 列表（按板块分组） */}
      {faults.length === 0 && !loading ? (
        <HudCard className="p-12 text-center">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">未找到匹配的故障方案</p>
        </HudCard>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([catId, list]) => (
            <section key={catId}>
              <div className="flex items-center gap-2 mb-3">
                <span className="chip">{categoryLabel[catId] || catId}</span>
                <span className="text-xs font-mono text-slate-500">
                  {list.length} 条
                </span>
                <div className="flex-1 h-px bg-ink-700/60" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((fault, idx) => (
                  <motion.div
                    key={fault.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  >
                    <Link to={`/knowledge/${fault.id}`}>
                      <HudCard className="p-4 h-full group">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                            {fault.title}
                          </h3>
                          <SeverityTag severity={fault.severity} />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                          {fault.symptom}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-ink-700/60">
                          <span className="text-[10px] font-mono text-slate-500">
                            原因：{fault.cause.length > 24
                              ? fault.cause.substring(0, 24) + "..."
                              : fault.cause}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400">
                            频次 {fault.frequency}
                          </span>
                        </div>
                      </HudCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
