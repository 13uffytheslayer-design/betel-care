// 管理后台布局壳：复用 PageShell + 顶部子导航
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Cpu,
  LifeBuoy,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import PageShell from "./PageShell";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const ADMIN_NAV = [
  { to: "/admin", label: "总览", icon: BarChart3, exact: true },
  { to: "/admin/faults", label: "故障知识库", icon: LifeBuoy },
  { to: "/admin/devices", label: "设备与板块", icon: Cpu },
  { to: "/admin/feedback", label: "反馈管理", icon: MessageSquare },
];

export default function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  return (
    <PageShell title={title} subtitle={subtitle}>
      {/* 管理员标识 + 子导航 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 chip border-amber-500/40 text-amber-300 bg-amber-500/5">
          <ShieldCheck className="w-3 h-3" />
          管理后台
        </span>
        <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {ADMIN_NAV.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium clip-corner-sm border transition-all",
                  active
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : "border-ink-700 text-slate-400 hover:text-slate-200 hover:border-ink-600",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </PageShell>
  );
}
