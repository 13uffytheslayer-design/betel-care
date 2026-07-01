// 状态指示灯 + 标签组件
import { cn, severityConfig, statusConfig } from "@/lib/utils";

export function StatusDot({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.offline;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cfg.dot} />
      <span className={cn("text-xs font-mono", cfg.color)}>{cfg.label}</span>
    </span>
  );
}

export function SeverityTag({ severity }: { severity: string }) {
  const cfg = severityConfig[severity] || severityConfig.low;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider clip-corner-sm border",
        cfg.bg,
        cfg.color,
        cfg.border,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function Chip({
  children,
  color = "default",
  className,
}: {
  children: React.ReactNode;
  color?: "default" | "cyan" | "amber" | "jade" | "crimson";
  className?: string;
}) {
  const colorMap = {
    default: "border-ink-700 text-slate-300",
    cyan: "border-cyan-500/40 text-cyan-300 bg-cyan-500/5",
    amber: "border-amber-500/40 text-amber-300 bg-amber-500/5",
    jade: "border-jade-500/40 text-jade-300 bg-jade-500/5",
    crimson: "border-crimson-500/40 text-crimson-300 bg-crimson-500/5",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase tracking-wider bg-ink-800 border clip-corner-sm",
        colorMap[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
