// HUD 风格卡片：切角 + 辉光 + 光扫
import { cn } from "@/lib/utils";

export default function HudCard({
  children,
  className,
  glow = true,
  sweep = true,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  sweep?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-ink-850/80 border border-ink-700 clip-corner backdrop-blur-sm",
        glow && "transition-all duration-300 hover:border-cyan-500/50 hover:shadow-glow-cyan",
        sweep && "sweep",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

// HUD 卡片标题栏
export function HudCardHeader({
  title,
  icon,
  accent = "cyan",
  right,
}: {
  title: string;
  icon?: React.ReactNode;
  accent?: "cyan" | "amber" | "jade" | "crimson";
  right?: React.ReactNode;
}) {
  const accentMap = {
    cyan: "text-cyan-400 border-cyan-500/30",
    amber: "text-amber-400 border-amber-500/30",
    jade: "text-jade-400 border-jade-500/30",
    crimson: "text-crimson-400 border-crimson-500/30",
  };
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b bg-ink-900/40",
        accentMap[accent],
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-display font-semibold text-sm tracking-wide text-slate-100">
          {title}
        </h3>
      </div>
      {right}
    </div>
  );
}
