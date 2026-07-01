// 顶部导航栏
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Cpu,
  LayoutDashboard,
  LifeBuoy,
  LogIn,
  LogOut,
  MessageSquare,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "工作台", icon: LayoutDashboard },
  { to: "/devices", label: "设备中心", icon: Cpu },
  { to: "/chat", label: "智能客服", icon: Bot },
  { to: "/knowledge", label: "故障知识库", icon: LifeBuoy },
  { to: "/feedback", label: "反馈中心", icon: MessageSquare },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 grid place-items-center clip-corner-sm bg-cyan-500/10 border border-cyan-500/40">
            <div className="absolute inset-0 bg-scan-line bg-[length:200%_100%] animate-scan-move opacity-40" />
            <Cpu className="w-5 h-5 text-cyan-400 relative z-10" />
          </div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-lg leading-none text-glow-cyan">
              BETEL<span className="text-cyan-400">·CARE</span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              槟榔设备售后平台
            </div>
          </div>
        </Link>

        {/* 导航 */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors clip-corner-sm",
                  active
                    ? "text-cyan-300 bg-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-ink-800/60",
                )}
              >
                <Icon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                {item.label}
                {active && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-px bg-cyan-400 shadow-glow-cyan" />
                )}
              </Link>
            );
          })}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors clip-corner-sm border",
                pathname.startsWith("/admin")
                  ? "text-amber-300 bg-amber-500/10 border-amber-500/40"
                  : "text-amber-400/80 border-amber-500/20 hover:text-amber-300 hover:bg-amber-500/5",
              )}
              title="管理后台"
            >
              <ShieldCheck className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              管理后台
              {pathname.startsWith("/admin") && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-px bg-amber-400" />
              )}
            </Link>
          )}
        </nav>

        {/* 用户 */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 clip-corner-sm border border-ink-700 hover:border-cyan-500/50 transition-colors"
              >
                <div className="w-7 h-7 grid place-items-center bg-cyan-500/15 text-cyan-300 text-xs font-bold font-mono clip-corner-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden md:inline text-sm text-slate-200">
                  {user.name}
                </span>
              </Link>
              {/* 管理后台入口：仅管理员可见，所有屏幕尺寸都显示（移动端也能进） */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-2 clip-corner-sm border text-xs font-medium transition-all",
                    pathname.startsWith("/admin")
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
                      : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300",
                  )}
                  title="管理后台"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">管理后台</span>
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="p-2 text-slate-400 hover:text-crimson-400 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">
              <LogIn className="w-4 h-4" />
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
