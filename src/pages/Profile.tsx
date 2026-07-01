// 个人中心：用户信息卡 + 我的反馈 + 快捷入口 + 退出登录
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Building2,
  CalendarClock,
  Cpu,
  LogOut,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Wrench,
  LifeBuoy,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import { SeverityTag, Chip } from "@/components/Status";
import { useAuthStore } from "@/lib/store";
import { feedbackApi } from "@/lib/api";
import { categoryLabel, cn, formatDate } from "@/lib/utils";
import type { Feedback } from "@shared/types";

const ROLE_LABEL: Record<string, string> = {
  user: "设备使用方",
  engineer: "运维工程师",
  admin: "平台管理员",
};

const TYPE_LABEL: Record<string, string> = {
  exception: "异常问题",
  suggestion: "改进建议",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "待处理",
  processing: "处理中",
  resolved: "已解决",
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    feedbackApi
      .mine()
      .then((data) => {
        if (active) setFeedbacks(data);
      })
      .catch(() => {
        // 已登录但接口失败时静默，保留空列表
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // 统计聚合
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const resolved = feedbacks.filter((f) => f.status === "resolved").length;
    const processing = feedbacks.filter(
      (f) => f.status === "pending" || f.status === "processing",
    ).length;
    const exceptions = feedbacks.filter((f) => f.type === "exception").length;
    return { total, resolved, processing, exceptions };
  }, [feedbacks]);

  const recent = useMemo(
    () =>
      [...feedbacks]
        .sort(
          (a, b) =>
            new Date(b.createdAt.replace(" ", "T")).getTime() -
            new Date(a.createdAt.replace(" ", "T")).getTime(),
        )
        .slice(0, 5),
    [feedbacks],
  );

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  if (!user) return null;

  return (
    <PageShell title="个人中心" subtitle="ACCOUNT · 个人资料与反馈跟踪">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 用户信息卡 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1"
        >
          <HudCard className="overflow-hidden" sweep={false}>
            <div className="relative px-6 py-8 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 border-b border-ink-700">
              <div className="absolute inset-0 bg-radial-cyan opacity-50" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 grid place-items-center clip-corner bg-cyan-500/15 border border-cyan-500/50">
                  <div className="absolute inset-0 bg-scan-line bg-[length:200%_100%] animate-scan-move opacity-30" />
                  <span className="num text-3xl font-bold text-cyan-300 relative z-10">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-slate-50">
                  {user.name}
                </h2>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  <Chip color="cyan">
                    <ShieldCheck className="w-3 h-3" />
                    {ROLE_LABEL[user.role] || user.role}
                  </Chip>
                  {user.company && (
                    <Chip>
                      <Building2 className="w-3 h-3" />
                      {user.company}
                    </Chip>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="邮箱" value={user.email} />
              <InfoRow
                icon={<CalendarClock className="w-4 h-4" />}
                label="注册时间"
                value={formatDate(user.createdAt)}
              />
              <InfoRow
                icon={<UserIcon className="w-4 h-4" />}
                label="用户ID"
                value={`#${String(user.id).padStart(6, "0")}`}
                mono
              />
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={handleLogout}
                className="btn-danger w-full !py-2.5 text-sm"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </HudCard>
        </motion.div>

        {/* 右侧内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 我的反馈统计 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <MiniStat
              label="反馈总数"
              value={stats.total}
              icon={<MessageSquare className="w-4 h-4" />}
              accent="cyan"
            />
            <MiniStat
              label="已解决"
              value={stats.resolved}
              icon={<ShieldCheck className="w-4 h-4" />}
              accent="jade"
            />
            <MiniStat
              label="处理中"
              value={stats.processing}
              icon={<Wrench className="w-4 h-4" />}
              accent="amber"
            />
            <MiniStat
              label="异常问题"
              value={stats.exceptions}
              icon={<LifeBuoy className="w-4 h-4" />}
              accent="crimson"
            />
          </motion.div>

          {/* 管理后台入口（仅管理员可见） */}
          {user.role === "admin" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              <Link to="/admin">
                <HudCard className="p-4 border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-colors" glow={false} sweep={false}>
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 grid place-items-center clip-corner-sm bg-amber-500/15 border border-amber-500/50 text-amber-300 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-amber-200">管理后台</h3>
                        <span className="text-[10px] font-mono text-amber-400/70 border border-amber-500/30 px-1.5 py-0.5 clip-corner-sm">
                          ADMIN
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/60 mt-1">
                        故障知识库维护 · 设备与板块管理 · 反馈分类统计与回复
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
                  </div>
                </HudCard>
              </Link>
            </motion.div>
          )}

          {/* 快捷入口 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <HudCard className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickLink to="/chat" icon={<Bot className="w-5 h-5" />} label="智能客服" />
                <QuickLink to="/devices" icon={<Cpu className="w-5 h-5" />} label="设备中心" />
                <QuickLink to="/knowledge" icon={<LifeBuoy className="w-5 h-5" />} label="故障知识库" />
                <QuickLink to="/feedback" icon={<MessageSquare className="w-5 h-5" />} label="反馈中心" />
              </div>
            </HudCard>
          </motion.div>

          {/* 我的反馈列表 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <HudCard>
              <HudCardHeader
                title="我的反馈"
                icon={<MessageSquare className="w-4 h-4" />}
                right={
                  <Link
                    to="/feedback"
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    全部 <ArrowRight className="w-3 h-3" />
                  </Link>
                }
              />
              <div className="p-4">
                {loading ? (
                  <div className="py-10 text-center text-sm text-slate-500 font-mono">
                    加载中...
                  </div>
                ) : recent.length === 0 ? (
                  <div className="py-10 text-center">
                    <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm text-slate-400">还没有反馈记录</p>
                    <Link
                      to="/feedback"
                      className="inline-flex items-center gap-1 mt-3 text-xs font-mono text-cyan-400 hover:text-cyan-300"
                    >
                      提交第一条反馈 <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recent.map((fb) => (
                      <li key={fb.id}>
                        <Link
                          to="/feedback"
                          className="block px-3 py-3 clip-corner-sm border border-ink-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <SeverityTag severity={fb.severity} />
                                <span className="text-[11px] font-mono text-slate-500">
                                  {TYPE_LABEL[fb.type] || fb.type}
                                </span>
                                <span className="text-[11px] font-mono text-slate-600">
                                  ·
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">
                                  {categoryLabel[fb.categoryId] || fb.categoryId}
                                </span>
                              </div>
                              <p className="text-sm text-slate-200 truncate">
                                {fb.title}
                              </p>
                              <p className="text-[11px] font-mono text-slate-500 mt-1">
                                {formatDate(fb.createdAt)}
                              </p>
                            </div>
                            <StatusPill status={fb.status} />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </HudCard>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-7 h-7 grid place-items-center clip-corner-sm bg-ink-800 border border-ink-700 text-cyan-400 shrink-0">
        {icon}
      </span>
      <span className="text-xs font-mono text-slate-500 uppercase tracking-wider w-16 shrink-0">
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-slate-200 truncate",
          mono && "font-mono",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "cyan" | "amber" | "jade" | "crimson";
}) {
  const accentMap = {
    cyan: "text-cyan-400 border-cyan-500/30",
    amber: "text-amber-400 border-amber-500/30",
    jade: "text-jade-400 border-jade-500/30",
    crimson: "text-crimson-400 border-crimson-500/30",
  };
  return (
    <HudCard className="p-3" glow={false} sweep={false}>
      <div className={cn("flex items-center gap-2 mb-2", accentMap[accent].split(" ")[0])}>
        <span className={cn("w-6 h-6 grid place-items-center clip-corner-sm bg-ink-800 border", accentMap[accent])}>
          {icon}
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={cn("num text-2xl font-bold tabular-nums", accentMap[accent].split(" ")[0])}>
        {value}
      </div>
    </HudCard>
  );
}

function QuickLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-2 py-4 px-2 clip-corner-sm border border-ink-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
    >
      <span className="w-10 h-10 grid place-items-center clip-corner-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:shadow-glow-cyan transition-all">
        {icon}
      </span>
      <span className="text-xs text-slate-300 font-medium">{label}</span>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = STATUS_LABEL[status] || status;
  const colorMap: Record<string, string> = {
    pending: "text-slate-400 border-ink-600 bg-ink-800/60",
    processing: "text-amber-300 border-amber-500/40 bg-amber-500/10",
    resolved: "text-jade-300 border-jade-500/40 bg-jade-500/10",
  };
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider clip-corner-sm border",
        colorMap[status] || colorMap.pending,
      )}
    >
      {label}
    </span>
  );
}
