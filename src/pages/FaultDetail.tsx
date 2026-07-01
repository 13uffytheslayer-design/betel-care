// 故障解决方案详情页
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ScanLine,
  Scissors,
  Wrench,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import { SeverityTag } from "@/components/Status";
import { faultApi } from "@/lib/api";
import { categoryLabel, cn } from "@/lib/utils";
import type { Fault } from "@shared/types";
import { useChatContext } from "@/lib/store";
import { useNavigate } from "react-router-dom";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  "seed-sorter": <ScanLine className="w-4 h-4" />,
  "sheet-sorter": <Layers className="w-4 h-4" />,
  "seed-cutter": <Scissors className="w-4 h-4" />,
};

export default function FaultDetail() {
  const { faultId = "" } = useParams();
  const navigate = useNavigate();
  const { setCategory } = useChatContext();
  const [fault, setFault] = useState<Fault | null>(null);
  const [related, setRelated] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    faultApi
      .detail(faultId)
      .then((f) => {
        setFault(f);
        // 加载关联故障
        if (f.relatedFaultIds.length > 0) {
          Promise.all(f.relatedFaultIds.map((id) => faultApi.detail(id).catch(() => null)))
            .then((rs) => setRelated(rs.filter(Boolean) as Fault[]));
        } else {
          setRelated([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [faultId]);

  const askBot = () => {
    if (fault) setCategory(fault.categoryId);
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

  if (!fault) {
    return (
      <PageShell>
        <HudCard className="p-12 text-center">
          <p className="text-slate-400">故障方案不存在</p>
          <Link to="/knowledge" className="btn-ghost mt-4 inline-flex">
            <ArrowLeft className="w-4 h-4" /> 返回知识库
          </Link>
        </HudCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Link
        to="/knowledge"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 mb-4 font-mono"
      >
        <ArrowLeft className="w-4 h-4" /> 返回知识库
      </Link>

      {/* 头部 */}
      <HudCard className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="w-14 h-14 grid place-items-center clip-corner bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="chip flex items-center gap-1">
                {CATEGORY_ICON[fault.categoryId]}
                {categoryLabel[fault.categoryId]}
              </span>
              <SeverityTag severity={fault.severity} />
              <span className="text-xs font-mono text-amber-400">
                出现频次 {fault.frequency}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100">
              {fault.title}
            </h1>
          </div>
          <button onClick={askBot} className="btn-primary shrink-0">
            <Wrench className="w-4 h-4" />
            咨询客服
          </button>
        </div>
      </HudCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 故障现象 */}
          <HudCard>
            <HudCardHeader title="故障现象" icon={<AlertTriangle className="w-4 h-4" />} accent="amber" />
            <div className="p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {fault.symptom}
              </p>
            </div>
          </HudCard>

          {/* 原因分析 */}
          <HudCard>
            <HudCardHeader title="原因分析" icon={<Cpu className="w-4 h-4" />} />
            <div className="p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {fault.cause}
              </p>
            </div>
          </HudCard>

          {/* 解决步骤 */}
          <HudCard>
            <HudCardHeader
              title="处理步骤"
              icon={<CheckCircle2 className="w-4 h-4" />}
              accent="jade"
              right={
                <span className="text-xs font-mono text-slate-500">
                  {fault.solution.steps.length} 步
                </span>
              }
            />
            <div className="p-4 space-y-3">
              {fault.solution.steps.map((step, idx) => (
                <motion.div
                  key={step.order}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex gap-3 p-3 bg-ink-900/40 border border-ink-700/60 clip-corner-sm"
                >
                  <div className="w-8 h-8 grid place-items-center bg-jade-500/15 text-jade-400 font-mono text-sm font-bold clip-corner-sm shrink-0">
                    {step.order}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-100 mb-1">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </HudCard>
        </div>

        {/* 右侧：注意事项 + 关联故障 */}
        <aside className="lg:col-span-1 space-y-6">
          {/* 注意事项 */}
          <HudCard className="border-amber-500/30">
            <HudCardHeader
              title="注意事项"
              icon={<AlertTriangle className="w-4 h-4" />}
              accent="amber"
            />
            <div className="p-4 space-y-2.5">
              {fault.solution.cautions.map((c, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 p-2.5 bg-amber-500/5 border border-amber-500/20 clip-corner-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-amber-100/90 leading-relaxed">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </HudCard>

          {/* 关联故障 */}
          {related.length > 0 && (
            <HudCard>
              <HudCardHeader title="关联故障" icon={<ArrowRight className="w-4 h-4" />} />
              <div className="p-3 space-y-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/knowledge/${r.id}`}
                    className={cn(
                      "block px-3 py-2.5 clip-corner-sm border border-ink-700/60",
                      "hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-colors",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-slate-200 truncate">
                        {r.title}
                      </span>
                      <SeverityTag severity={r.severity} />
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      频次 {r.frequency}
                    </div>
                  </Link>
                ))}
              </div>
            </HudCard>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
