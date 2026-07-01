// 反馈管理：分类统计看板（管理员专属）+ 全部反馈列表 + 回复 + 状态流转
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquarePlus,
  Send,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminShell from "@/components/AdminShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import StatCard from "@/components/StatCard";
import { SeverityTag } from "@/components/Status";
import { adminApi, ApiError } from "@/lib/api";
import { categoryLabel, cn, formatDate, severityConfig } from "@/lib/utils";
import type {
  Feedback,
  FeedbackStats,
  FeedbackStatus,
} from "@shared/types";

type Tab = "stats" | "list";

const SEVERITY_COLORS: Record<string, string> = {
  low: "#00FF88",
  medium: "#00D9FF",
  high: "#FFB800",
  critical: "#FF3D5A",
};

const STATUS_CFG: Record<FeedbackStatus, { label: string; color: string; dot: string }> = {
  pending: { label: "待处理", color: "text-amber-400", dot: "bg-amber-400" },
  processing: { label: "处理中", color: "text-cyan-400", dot: "bg-cyan-400" },
  resolved: { label: "已解决", color: "text-jade-400", dot: "bg-jade-400" },
};

export default function AdminFeedback() {
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [list, setList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([
        adminApi.feedbackStats(),
        adminApi.listFeedbacks(),
      ]);
      setStats(s);
      setList(l);
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
    <AdminShell
      title="反馈管理"
      subtitle="ADMIN · 故障反馈分类统计 · 工单回复 · 状态流转"
    >
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

      {/* Tab 切换 */}
      <div className="flex items-center gap-2 mb-5">
        {(
          [
            { id: "stats" as Tab, label: "分类统计", icon: BarChart3 },
            { id: "list" as Tab, label: `反馈列表（${list.length}）`, icon: MessageSquarePlus },
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
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                  : "border-ink-700 text-slate-400 hover:text-slate-200 hover:border-ink-600",
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
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      ) : tab === "stats" ? (
        <StatsView stats={stats} />
      ) : (
        <ListView list={list} onChanged={load} onError={setError} />
      )}
    </AdminShell>
  );
}

// ===== 分类统计看板（管理员专属）=====
function StatsView({ stats }: { stats: FeedbackStats | null }) {
  if (!stats) {
    return (
      <HudCard className="p-10 text-center text-slate-500 text-sm">
        暂无统计数据
      </HudCard>
    );
  }

  const trendData = stats.trend.map((t) => ({
    date: t.date.substring(5),
    count: t.count,
  }));

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="反馈总数"
          value={stats.total}
          icon={<MessageSquarePlus className="w-5 h-5" />}
          accent="amber"
        />
        <StatCard
          label="异常问题"
          value={stats.byType.exception}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="crimson"
        />
        <StatCard
          label="功能建议"
          value={stats.byType.suggestion}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="jade"
        />
        <StatCard
          label="解决率"
          value={stats.resolvedRate}
          unit="%"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="jade"
        />
      </div>

      {/* 图表双联 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 问题类别聚类 */}
        <HudCard>
          <HudCardHeader
            title="故障反馈 · 问题类别聚类"
            icon={<BarChart3 className="w-4 h-4" />}
            accent="amber"
          />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.byProblemCategory.slice(0, 8)}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2230" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0A0E14",
                    border: "1px solid #222C3D",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "rgba(255,184,0,0.05)" }}
                />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {stats.byProblemCategory.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill="#FFB800" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </HudCard>

        {/* 趋势 */}
        <HudCard>
          <HudCardHeader
            title="近 14 天反馈趋势"
            icon={<TrendingUp className="w-4 h-4" />}
            accent="amber"
          />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2230" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0A0E14",
                    border: "1px solid #222C3D",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FFB800"
                  strokeWidth={2}
                  dot={{ fill: "#FFB800", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </HudCard>
      </div>

      {/* 严重度 + 板块 + 关键词 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 严重度分布 */}
        <HudCard className="p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
            严重度分布
          </div>
          <div className="space-y-3">
            {stats.bySeverity.map((s) => {
              const cfg = severityConfig[s.severity];
              const pct = stats.total > 0 ? (s.count / stats.total) * 100 : 0;
              return (
                <div key={s.severity}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-xs font-mono", cfg.color)}>
                      {cfg.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {s.count} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-ink-800 clip-corner-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full clip-corner-sm"
                      style={{ background: SEVERITY_COLORS[s.severity] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </HudCard>

        {/* 设备板块分布 */}
        <HudCard className="p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
            设备板块分布
          </div>
          <div className="space-y-3">
            {stats.byCategory.map((c) => {
              const pct = stats.total > 0 ? (c.count / stats.total) * 100 : 0;
              return (
                <div key={c.categoryId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300">
                      {categoryLabel[c.categoryId] || c.name}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{c.count}</span>
                  </div>
                  <div className="h-2 bg-ink-800 clip-corner-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-amber-500 clip-corner-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </HudCard>

        {/* TOP 关键词 */}
        <HudCard className="p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
            TOP 关键词
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {stats.topKeywords.length === 0 ? (
              <span className="text-xs text-slate-500">暂无数据</span>
            ) : (
              stats.topKeywords.map((kw, i) => {
                const size = Math.min(Math.max(11 + kw.weight * 2, 11), 22);
                const opacity = Math.min(0.5 + kw.weight * 0.15, 1);
                return (
                  <motion.span
                    key={kw.word}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ fontSize: `${size}px` }}
                    className="font-mono text-amber-300 hover:text-amber-100 cursor-default"
                  >
                    {kw.word}
                  </motion.span>
                );
              })
            )}
          </div>
        </HudCard>
      </div>
    </div>
  );
}

// ===== 反馈列表（管理员视角）=====
function ListView({
  list,
  onChanged,
  onError,
}: {
  list: Feedback[];
  onChanged: () => void;
  onError: (m: string) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | FeedbackStatus>("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = useMemo(() => {
    return list.filter((fb) => {
      if (statusFilter && fb.status !== statusFilter) return false;
      if (categoryFilter && fb.categoryId !== categoryFilter) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        return (
          fb.title.toLowerCase().includes(kw) ||
          fb.description.toLowerCase().includes(kw) ||
          (fb.userName || "").toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }, [list, keyword, statusFilter, categoryFilter]);

  if (list.length === 0) {
    return (
      <HudCard className="p-12 text-center">
        <MessageSquarePlus className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">暂无反馈记录</p>
      </HudCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* 筛选工具栏 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索标题/描述/提交人..."
          className="flex-1 px-3 py-2 bg-ink-900/60 border border-ink-600 text-slate-100 text-sm placeholder:text-slate-600 clip-corner-sm outline-none focus:border-amber-500/70"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | FeedbackStatus)}
          className="px-3 py-2 bg-ink-900/60 border border-ink-600 text-slate-200 text-sm clip-corner-sm outline-none focus:border-amber-500/70"
        >
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="resolved">已解决</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-ink-900/60 border border-ink-600 text-slate-200 text-sm clip-corner-sm outline-none focus:border-amber-500/70"
        >
          <option value="">全部板块</option>
          {Object.entries(categoryLabel).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <HudCard className="p-8 text-center text-slate-500 text-sm">
          没有匹配的反馈
        </HudCard>
      ) : (
        filtered.map((fb, idx) => (
          <motion.div
            key={fb.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.25) }}
          >
            <FeedbackRow fb={fb} onChanged={onChanged} onError={onError} />
          </motion.div>
        ))
      )}
    </div>
  );
}

function FeedbackRow({
  fb,
  onChanged,
  onError,
}: {
  fb: Feedback;
  onChanged: () => void;
  onError: (m: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState(fb.reply ?? "");
  const [saving, setSaving] = useState(false);

  async function handleReply() {
    if (!reply.trim()) {
      onError("回复内容不能为空");
      return;
    }
    setSaving(true);
    try {
      await adminApi.replyFeedback(fb.id, reply.trim());
      onChanged();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "回复失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(status: FeedbackStatus) {
    setSaving(true);
    try {
      await adminApi.updateFeedbackStatus(fb.id, status);
      onChanged();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "状态更新失败");
    } finally {
      setSaving(false);
    }
  }

  const st = STATUS_CFG[fb.status];

  return (
    <HudCard className="overflow-hidden" glow={false}>
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-slate-500 hover:text-amber-300 transition-colors mt-0.5"
          title={expanded ? "收起" : "展开"}
        >
          <Clock className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="chip">{categoryLabel[fb.categoryId] || fb.categoryId}</span>
            <span
              className={cn(
                "chip",
                fb.type === "exception"
                  ? "border-crimson-500/40 text-crimson-300"
                  : "border-jade-500/40 text-jade-300",
              )}
            >
              {fb.type === "exception" ? "异常" : "建议"}
            </span>
            <SeverityTag severity={fb.severity} />
            <span className="text-[10px] font-mono text-slate-500">
              {fb.problemCategory}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-100">{fb.title}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {fb.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-500">
            <span>
              提交人：{fb.userName || (fb.userId ? `#${fb.userId}` : "匿名")}
            </span>
            <span>·</span>
            <span>{formatDate(fb.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={cn("text-xs font-mono flex items-center gap-1.5", st.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
            {st.label}
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[10px] font-mono text-slate-500 hover:text-amber-300"
          >
            {expanded ? "收起 ▲" : "处理 ▼"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-ink-700/60"
          >
            <div className="p-4 space-y-3">
              {/* 状态流转 */}
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                  状态流转
                </div>
                <div className="flex items-center gap-1.5">
                  {(["pending", "processing", "resolved"] as FeedbackStatus[]).map(
                    (s) => {
                      const cfg = STATUS_CFG[s];
                      const active = fb.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatus(s)}
                          disabled={saving || active}
                          className={cn(
                            "px-3 py-1.5 text-xs clip-corner-sm border transition-all disabled:opacity-50",
                            active
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                              : "border-ink-700 text-slate-400 hover:border-ink-600 hover:text-slate-200",
                          )}
                        >
                          {cfg.label}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* 已有回复 */}
              {fb.reply && (
                <div className="p-2.5 bg-cyan-500/5 border border-cyan-500/20 clip-corner-sm">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1">
                    官方回复
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{fb.reply}</p>
                </div>
              )}

              {/* 回复输入 */}
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                  {fb.reply ? "追加 / 修改回复" : "回复反馈"}
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder="输入回复内容，提交后状态自动置为已解决..."
                    className="input resize-none flex-1 text-xs"
                  />
                  <button
                    onClick={handleReply}
                    disabled={saving}
                    className="btn-primary !py-2 text-xs shrink-0 disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    发送
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HudCard>
  );
}
