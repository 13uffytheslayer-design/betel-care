// 管理后台总览：平台 KPI + 反馈分类概览 + 快捷管理入口
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  LifeBuoy,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import StatCard from "@/components/StatCard";
import { adminApi, deviceApi } from "@/lib/api";
import type { DashboardStats, FeedbackStats } from "@shared/types";

export default function AdminDashboard() {
  const [dash, setDash] = useState<DashboardStats | null>(null);
  const [fbStats, setFbStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([deviceApi.dashboard(), adminApi.feedbackStats()])
      .then(([d, f]) => {
        if (!active) return;
        setDash(d);
        setFbStats(f);
      })
      .catch((e) => {
        if (active) setError(e?.message || "加载失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <AdminShell title="管理后台" subtitle="ADMIN · 平台运营总览">
        <div className="grid place-items-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell title="管理后台" subtitle="ADMIN · 平台运营总览">
        <HudCard className="p-6 text-center text-crimson-300 text-sm">{error}</HudCard>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="管理后台" subtitle="ADMIN · 平台运营总览">
      <div className="space-y-6">
        {/* 平台 KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="设备总数"
            value={dash?.totalDevices ?? 0}
            icon={<Cpu className="w-5 h-5" />}
            accent="cyan"
            trend={`在线 ${dash?.onlineDevices ?? 0}`}
          />
          <StatCard
            label="知识库条目"
            value={dash?.knowledgeCount ?? 0}
            icon={<LifeBuoy className="w-5 h-5" />}
            accent="jade"
            trend="故障解决方案"
          />
          <StatCard
            label="反馈总量"
            value={dash?.feedbackCount ?? 0}
            icon={<MessageSquare className="w-5 h-5" />}
            accent="amber"
            trend={`解决率 ${fbStats?.resolvedRate ?? 0}%`}
          />
          <StatCard
            label="平均响应"
            value={dash?.avgResponseMin ?? 0}
            unit="分钟"
            icon={<TrendingUp className="w-5 h-5" />}
            accent="crimson"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 反馈分类概览 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <HudCard>
              <HudCardHeader
                title="故障反馈分类统计"
                icon={<MessageSquare className="w-4 h-4" />}
                accent="amber"
                right={
                  <Link
                    to="/admin/feedback"
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    详情 <ArrowRight className="w-3 h-3" />
                  </Link>
                }
              />
              <div className="p-4 space-y-4">
                {/* 按问题类别 */}
                <div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                    按问题类别
                  </div>
                  <div className="space-y-2">
                    {(fbStats?.byProblemCategory ?? []).slice(0, 6).map((c) => {
                      const max = Math.max(
                        ...(fbStats?.byProblemCategory ?? [{ count: 1 }]).map(
                          (x) => x.count,
                        ),
                        1,
                      );
                      return (
                        <div key={c.name} className="flex items-center gap-3">
                          <span className="w-20 shrink-0 text-xs text-slate-300 truncate">
                            {c.name}
                          </span>
                          <div className="flex-1 h-2 bg-ink-800 clip-corner-sm overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400 transition-all"
                              style={{ width: `${(c.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="num text-xs text-amber-300 w-8 text-right">
                            {c.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 按严重度 */}
                <div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                    按严重度
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(fbStats?.bySeverity ?? []).map((s) => {
                      const colorMap: Record<string, string> = {
                        low: "text-jade-400",
                        medium: "text-cyan-400",
                        high: "text-amber-400",
                        critical: "text-crimson-400",
                      };
                      const labelMap: Record<string, string> = {
                        low: "低",
                        medium: "中",
                        high: "高",
                        critical: "紧急",
                      };
                      return (
                        <div
                          key={s.severity}
                          className="px-3 py-2 bg-ink-900/60 border border-ink-700 clip-corner-sm text-center"
                        >
                          <div className={`num text-xl font-bold ${colorMap[s.severity]}`}>
                            {s.count}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {labelMap[s.severity]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </HudCard>
          </motion.div>

          {/* 快捷管理入口 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <HudCard className="p-4">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-3">
                快捷管理
              </div>
              <div className="space-y-2">
                <AdminEntry
                  to="/admin/faults"
                  icon={<LifeBuoy className="w-5 h-5" />}
                  title="故障知识库"
                  desc="更新解决方案 · 新增故障条目"
                  accent="jade"
                />
                <AdminEntry
                  to="/admin/devices"
                  icon={<Cpu className="w-5 h-5" />}
                  title="设备与板块"
                  desc="新增设备 · 维护设备板块"
                  accent="cyan"
                />
                <AdminEntry
                  to="/admin/feedback"
                  icon={<MessageSquare className="w-5 h-5" />}
                  title="反馈管理"
                  desc="分类统计 · 回复工单"
                  accent="amber"
                />
              </div>
            </HudCard>
          </motion.div>
        </div>
      </div>
    </AdminShell>
  );
}

function AdminEntry({
  to,
  icon,
  title,
  desc,
  accent,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: "cyan" | "amber" | "jade";
}) {
  const colorMap = {
    cyan: "text-cyan-400 border-cyan-500/30",
    amber: "text-amber-400 border-amber-500/30",
    jade: "text-jade-400 border-jade-500/30",
  };
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 p-3 clip-corner-sm border border-ink-700 hover:border-ink-600 hover:bg-ink-800/40 transition-all"
    >
      <span
        className={`w-10 h-10 grid place-items-center clip-corner-sm bg-ink-800 border ${colorMap[accent]}`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-200">{title}</div>
        <div className="text-[11px] font-mono text-slate-500 truncate">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
    </Link>
  );
}
