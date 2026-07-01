// 设备详情页
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Cpu,
  Database,
  Layers,
  ScanLine,
  Scissors,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import { SeverityTag, StatusDot } from "@/components/Status";
import { deviceApi } from "@/lib/api";
import { categoryLabel, cn } from "@/lib/utils";
import { useChatContext } from "@/lib/store";
import type { DeviceDetail } from "@shared/types";
import { useNavigate } from "react-router-dom";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  "seed-sorter": <ScanLine className="w-5 h-5" />,
  "sheet-sorter": <Layers className="w-5 h-5" />,
  "seed-cutter": <Scissors className="w-5 h-5" />,
};

export default function DeviceDetail() {
  const { categoryId = "", deviceId = "" } = useParams();
  const navigate = useNavigate();
  const { setCategory, setDevice } = useChatContext();
  const [detail, setDetail] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    deviceApi
      .detail(deviceId)
      .then((d) => setDetail(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [deviceId]);

  const startChat = () => {
    setCategory(categoryId);
    setDevice(deviceId);
    navigate("/chat");
  };

  if (loading) {
    return (
      <PageShell>
        <div className="grid place-items-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!detail) {
    return (
      <PageShell>
        <HudCard className="p-12 text-center">
          <p className="text-slate-400">设备不存在</p>
          <Link to="/devices" className="btn-ghost mt-4 inline-flex">
            <ArrowLeft className="w-4 h-4" /> 返回设备中心
          </Link>
        </HudCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Link
        to="/devices"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 mb-4 font-mono"
      >
        <ArrowLeft className="w-4 h-4" /> 返回设备中心
      </Link>

      {/* 设备头部 */}
      <HudCard className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="w-20 h-20 grid place-items-center clip-corner bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            {CATEGORY_ICON[detail.categoryId] || <Cpu className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="chip">{categoryLabel[detail.categoryId]}</span>
              <span className="font-mono text-sm text-cyan-400">
                {detail.model}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100">
              {detail.name}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <StatusDot status={detail.status} />
              <span className="font-mono text-slate-500">ID: {detail.id}</span>
            </div>
          </div>
          <button onClick={startChat} className="btn-primary shrink-0">
            <Bot className="w-4 h-4" />
            咨询此设备故障
          </button>
        </div>
      </HudCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 设备参数 */}
        <div className="lg:col-span-1">
          <HudCard>
            <HudCardHeader title="技术参数" icon={<Cpu className="w-4 h-4" />} />
            <div className="p-4 space-y-2">
              {detail.specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 bg-ink-900/40 border border-ink-700/60 clip-corner-sm"
                >
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                    {spec.label}
                  </span>
                  <span className="text-sm font-mono text-slate-100">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </HudCard>
        </div>

        {/* 关联故障 */}
        <div className="lg:col-span-2">
          <HudCard>
            <HudCardHeader
              title={`常见故障 (${detail.relatedFaults.length})`}
              icon={<Database className="w-4 h-4" />}
              accent="amber"
              right={
                <Link
                  to="/knowledge"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  查看全部 →
                </Link>
              }
            />
            <div className="p-4 space-y-2">
              {detail.relatedFaults.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  暂无常见故障记录
                </p>
              ) : (
                detail.relatedFaults.map((fault, idx) => (
                  <motion.div
                    key={fault.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={`/knowledge/${fault.id}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 clip-corner-sm border border-ink-700/60",
                        "hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-colors",
                      )}
                    >
                      <span className="w-8 h-8 grid place-items-center bg-ink-800 text-cyan-400 font-mono text-xs clip-corner-sm shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-200 truncate">
                          {fault.title}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                          频次 {fault.frequency} · {fault.symptom}
                        </div>
                      </div>
                      <SeverityTag severity={fault.severity} />
                      <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </HudCard>
        </div>
      </div>
    </PageShell>
  );
}
