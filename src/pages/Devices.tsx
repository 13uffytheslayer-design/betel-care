// 设备中心：板块导航 + 设备卡片网格
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Cpu,
  Layers,
  ScanLine,
  Scissors,
  Search,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import HudCard from "@/components/HudCard";
import { StatusDot } from "@/components/Status";
import { deviceApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Device, DeviceCategory } from "@shared/types";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  "seed-sorter": <ScanLine className="w-4 h-4" />,
  "sheet-sorter": <Layers className="w-4 h-4" />,
  "seed-cutter": <Scissors className="w-4 h-4" />,
};

export default function Devices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    deviceApi.categories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const catId = activeCategory === "all" ? undefined : activeCategory;
    deviceApi.list(catId).then(setDevices).catch(console.error);
  }, [activeCategory]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return devices;
    const kw = keyword.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        d.model.toLowerCase().includes(kw) ||
        d.id.toLowerCase().includes(kw),
    );
  }, [devices, keyword]);

  const selectCategory = (id: string) => {
    if (id === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: id });
    }
  };

  return (
    <PageShell
      title="设备中心"
      subtitle="DEVICE CENTER · 三大槟榔设备板块 · 设备详情与状态"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧导航 */}
        <aside className="lg:col-span-1">
          <HudCard className="p-2 sticky top-24">
            <div className="px-3 py-2 text-xs font-mono uppercase tracking-widest text-slate-500">
              设备板块
            </div>
            <button
              onClick={() => selectCategory("all")}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors clip-corner-sm relative",
                activeCategory === "all"
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-ink-800/60",
              )}
            >
              {activeCategory === "all" && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 shadow-glow-cyan" />
              )}
              <Cpu className="w-4 h-4" />
              全部设备
              <span className="ml-auto text-xs font-mono text-slate-500">
                {devices.length}
              </span>
            </button>
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors clip-corner-sm relative text-left",
                    active
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-400 hover:text-slate-200 hover:bg-ink-800/60",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 shadow-glow-cyan" />
                  )}
                  {CATEGORY_ICON[cat.id] || <Cpu className="w-4 h-4" />}
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-xs font-mono text-slate-500">
                    {cat.deviceCount}
                  </span>
                </button>
              );
            })}

            {/* 搜索 */}
            <div className="px-2 pt-3 pb-2 mt-2 border-t border-ink-700/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索型号/名称"
                  className="w-full pl-9 pr-3 py-2 bg-ink-900 border border-ink-700 clip-corner-sm text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </HudCard>
        </aside>

        {/* 右侧设备网格 */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <HudCard className="p-12 text-center">
              <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">未找到匹配的设备</p>
            </HudCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((device, idx) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.06, 0.4) }}
                >
                  <Link to={`/devices/${device.categoryId}/${device.id}`}>
                    <HudCard className="p-5 h-full group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-mono text-xs text-cyan-400 mb-1">
                            {device.model}
                          </div>
                          <h3 className="font-display font-bold text-base text-slate-100">
                            {device.name}
                          </h3>
                        </div>
                        <StatusDot status={device.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {device.specs.slice(0, 4).map((spec, i) => (
                          <div
                            key={i}
                            className="px-2.5 py-1.5 bg-ink-900/60 border border-ink-700/60 clip-corner-sm"
                          >
                            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                              {spec.label}
                            </div>
                            <div className="text-xs font-mono text-slate-200 mt-0.5 truncate">
                              {spec.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-ink-700/60">
                        <span className="text-xs font-mono text-slate-400">
                          常见故障{" "}
                          <span className="text-amber-400 font-bold">
                            {device.commonFaultCount}
                          </span>{" "}
                          条
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </HudCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
