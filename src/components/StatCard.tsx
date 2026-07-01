// 数据看板 KPI 卡片
import { motion } from "framer-motion";
import { cn, formatNumber, useCountUp } from "@/lib/utils";
import HudCard from "./HudCard";

export default function StatCard({
  label,
  value,
  unit,
  icon,
  accent = "cyan",
  delay = 0,
  trend,
}: {
  label: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  accent?: "cyan" | "amber" | "jade" | "crimson";
  delay?: number;
  trend?: string;
}) {
  const animated = useCountUp(value, 900);
  const accentMap = {
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    jade: "text-jade-400",
    crimson: "text-crimson-400",
  };
  const glowMap = {
    cyan: "shadow-glow-cyan",
    amber: "shadow-glow-amber",
    jade: "shadow-glow-jade",
    crimson: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <HudCard className="p-4 lg:p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
              {label}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span
                className={cn(
                  "num text-3xl lg:text-4xl font-bold tabular-nums",
                  accentMap[accent],
                )}
              >
                {formatNumber(animated, value % 1 !== 0 ? 1 : 0)}
              </span>
              {unit && (
                <span className="text-sm text-slate-400 font-mono">{unit}</span>
              )}
            </div>
            {trend && (
              <div className="mt-1 text-xs text-slate-500 font-mono">{trend}</div>
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 grid place-items-center clip-corner-sm bg-ink-800 border border-ink-700",
              accentMap[accent],
              glowMap[accent],
            )}
          >
            {icon}
          </div>
        </div>
      </HudCard>
    </motion.div>
  );
}
