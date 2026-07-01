// 首页：Hero + 数据看板 + 设备板块入口
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  Cpu,
  Database,
  Layers,
  ScanLine,
  Scissors,
  Timer,
  TrendingUp,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import GridBackground from "@/components/GridBackground";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import StatCard from "@/components/StatCard";
import { StatusDot } from "@/components/Status";
import { deviceApi } from "@/lib/api";
import { categoryLabel, cn } from "@/lib/utils";
import type { DashboardStats, DeviceCategory } from "@shared/types";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  "seed-sorter": <ScanLine className="w-7 h-7" />,
  "sheet-sorter": <Layers className="w-7 h-7" />,
  "seed-cutter": <Scissors className="w-7 h-7" />,
};

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);

  useEffect(() => {
    Promise.all([deviceApi.dashboard(), deviceApi.categories()])
      .then(([s, c]) => {
        setStats(s);
        setCategories(c);
      })
      .catch(console.error);
  }, []);

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden clip-corner-lg border border-cyan-500/20 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-850 to-ink-950" />
        <GridBackground variant="hero" />
        <div className="relative z-10 px-6 py-12 lg:px-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 chip border-cyan-500/40 text-cyan-300">
              <span className="status-online" />
              <span className="font-mono text-[10px] tracking-widest">
                BETEL CARE PLATFORM · v2.4
              </span>
            </div>
            <h1 className="font-display text-4xl lg:text-6xl font-bold leading-[1.1] text-slate-50">
              槟榔产线设备的
              <br />
              <span className="text-cyan-400 text-glow-cyan">智能售后中枢</span>
            </h1>
            <p className="mt-5 text-base lg:text-lg text-slate-400 max-w-2xl leading-relaxed">
              覆盖槟榔选籽机、选片机、切籽机三大核心设备，
              通过<span className="text-cyan-300">智能客服诊断</span>、
              <span className="text-cyan-300">故障知识库</span>、
              <span className="text-cyan-300">反馈学习系统</span>，
              构建"设备-客户-平台"闭环，让产线停机时间最小化。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/chat" className="btn-primary">
                <Bot className="w-4 h-4" />
                立即咨询智能客服
              </Link>
              <Link to="/devices" className="btn-ghost">
                <Cpu className="w-4 h-4" />
                浏览设备中心
              </Link>
            </div>
          </motion.div>

          {/* 三大能力标签 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl"
          >
            {[
              {
                icon: <Bot className="w-5 h-5" />,
                title: "智能客服",
                desc: "设备上下文感知 · 故障诊断引导",
              },
              {
                icon: <Database className="w-5 h-5" />,
                title: "知识库",
                desc: "18+ 解决方案 · 注意事项警示",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "反馈学习",
                desc: "NLP 自动分类 · 高频问题聚类",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-3 bg-ink-850/60 border border-ink-700 clip-corner-sm"
              >
                <div className="text-cyan-400 shrink-0">{item.icon}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 数据看板 */}
      <section className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="在线设备"
            value={stats?.onlineDevices ?? 0}
            unit={`/ ${stats?.totalDevices ?? 0}`}
            icon={<Activity className="w-5 h-5" />}
            accent="jade"
            delay={0}
            trend="实时连接"
          />
          <StatCard
            label="本月解决工单"
            value={stats?.monthlyResolved ?? 0}
            icon={<TrendingUp className="w-5 h-5" />}
            accent="cyan"
            delay={0.1}
            trend="↑ 12% vs 上月"
          />
          <StatCard
            label="平均响应"
            value={stats?.avgResponseMin ?? 0}
            unit="min"
            icon={<Timer className="w-5 h-5" />}
            accent="amber"
            delay={0.2}
            trend="含客服+人工"
          />
          <StatCard
            label="知识库方案"
            value={stats?.knowledgeCount ?? 0}
            unit="条"
            icon={<Database className="w-5 h-5" />}
            accent="cyan"
            delay={0.3}
            trend="持续更新"
          />
        </div>
      </section>

      {/* 设备板块入口 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-slate-100">
            设备板块
          </h2>
          <Link
            to="/devices"
            className="text-sm text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link to={`/devices?category=${cat.id}`}>
                <HudCard className="p-5 h-full group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 grid place-items-center clip-corner bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:shadow-glow-cyan transition-all">
                      {CATEGORY_ICON[cat.id] || <Cpu className="w-7 h-7" />}
                    </div>
                    <StatusDot
                      status={cat.onlineCount === cat.deviceCount ? "online" : "warning"}
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-ink-700/60">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400">
                        设备 <span className="text-cyan-300 font-bold">{cat.deviceCount}</span>
                      </span>
                      <span className="text-slate-400">
                        在线 <span className="text-jade-400 font-bold">{cat.onlineCount}</span>
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </HudCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 最新故障公告 */}
      <section className="mt-8">
        <HudCard>
          <HudCardHeader
            title="最新故障公告"
            icon={<Activity className="w-4 h-4" />}
            accent="amber"
            right={
              <Link
                to="/knowledge"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                知识库 →
              </Link>
            }
          />
          <div className="p-4 space-y-2">
            {[
              { cat: "seed-cutter", title: "伺服驱动器 E-03 报警处置", sev: "critical" },
              { cat: "seed-sorter", title: "压缩空气含水量过高排查指南", sev: "medium" },
              { cat: "sheet-sorter", title: "HALCON 授权过期应急处理", sev: "critical" },
            ].map((item, i) => (
              <Link
                key={i}
                to="/knowledge"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 clip-corner-sm border border-transparent",
                  "hover:border-ink-600 hover:bg-ink-800/40 transition-colors",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-8 rounded-sm",
                    item.sev === "critical" ? "bg-crimson-500" : "bg-amber-500",
                  )}
                />
                <span className="chip !py-0.5 !text-[10px]">
                  {categoryLabel[item.cat]}
                </span>
                <span className="text-sm text-slate-300 flex-1 truncate">
                  {item.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              </Link>
            ))}
          </div>
        </HudCard>
      </section>
    </PageShell>
  );
}
