// 移动端底部 TabBar（小程序风格）：仅在小屏显示
// 模拟微信小程序 tabBar：5 个主入口 + 安全区适配
import { Link, useLocation } from "react-router-dom";
import {
  Bot,
  Cpu,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "工作台", icon: LayoutDashboard },
  { to: "/devices", label: "设备", icon: Cpu },
  { to: "/chat", label: "客服", icon: Bot },
  { to: "/knowledge", label: "知识库", icon: LifeBuoy },
  { to: "/feedback", label: "反馈", icon: MessageSquare },
];

export default function MobileTabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ink-700/80 bg-ink-950/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-14">
        {TABS.map((tab) => {
          const active =
            tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 transition-colors",
                active ? "text-cyan-300" : "text-slate-500 active:text-slate-300",
              )}
            >
              <Icon
                className={cn("w-5 h-5 transition-transform", active && "scale-110")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <span className="absolute top-0 w-8 h-0.5 bg-cyan-400 shadow-glow-cyan" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
