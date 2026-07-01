// 登录/注册合一页：含演示账号快捷登录
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Cpu,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  User as UserIcon,
  Building2,
  Sparkles,
} from "lucide-react";
import GridBackground from "@/components/GridBackground";
import { useAuthStore } from "@/lib/store";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, demoLogin } = useAuthStore();

  // 默认从 query 决定模式（?mode=register）
  const initialMode: Mode =
    new URLSearchParams(location.search).get("mode") === "register"
      ? "register"
      : "login";
  const [mode, setMode] = useState<Mode>(initialMode);

  // 表单字段
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<"user" | "engineer">("user");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }
    if (mode === "register" && !name) {
      setError("请输入姓名");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, name, company: company || undefined, role });
      }
      const redirect =
        new URLSearchParams(location.search).get("redirect") || "/";
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "请求失败，请重试";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setError(null);
    setLoading(true);
    try {
      await demoLogin();
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "演示登录失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* 左侧品牌区 */}
      <div className="relative lg:w-1/2 min-h-[280px] lg:min-h-screen flex items-center justify-center px-8 py-12 overflow-hidden bg-gradient-to-br from-ink-900 via-ink-850 to-ink-950">
        <GridBackground variant="hero" />
        <div className="absolute inset-0 bg-radial-cyan opacity-60" />
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <div className="relative w-12 h-12 grid place-items-center clip-corner-sm bg-cyan-500/10 border border-cyan-500/40">
                <div className="absolute inset-0 bg-scan-line bg-[length:200%_100%] animate-scan-move opacity-40" />
                <Cpu className="w-6 h-6 text-cyan-400 relative z-10" />
              </div>
              <div>
                <div className="font-display font-bold text-2xl leading-none text-glow-cyan">
                  BETEL<span className="text-cyan-400">·CARE</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  槟榔设备售后平台
                </div>
              </div>
            </Link>

            <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight text-slate-50">
              产线不停，
              <br />
              <span className="text-cyan-400 text-glow-cyan">售后无忧</span>
            </h1>
            <p className="mt-4 text-sm lg:text-base text-slate-400 leading-relaxed">
              覆盖槟榔选籽机、选片机、切籽机三大核心设备，
              智能客服即时诊断，故障知识库秒级检索，反馈学习持续优化。
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: Sparkles, label: "智能客服 · 设备上下文感知诊断" },
                { icon: ShieldCheck, label: "故障知识库 · 17 类常见故障解决方案" },
                { icon: Cpu, label: "反馈学习 · NLP 自动分类聚合" },
              ].map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <div className="w-8 h-8 grid place-items-center clip-corner-sm bg-cyan-500/10 border border-cyan-500/30">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="font-mono">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-ink-850/80 border border-ink-700 clip-corner-lg backdrop-blur-sm"
          >
            {/* 模式切换 */}
            <div className="grid grid-cols-2 border-b border-ink-700">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    "relative py-4 text-sm font-semibold transition-colors",
                    mode === m
                      ? "text-cyan-300"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {m === "login" ? "账号登录" : "注册新账号"}
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-cyan-400 shadow-glow-cyan"
                    />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <h2 className="font-display text-lg font-bold text-slate-100">
                  {mode === "login" ? "欢迎回来" : "创建您的账号"}
                </h2>
              </div>

              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 px-3 py-2 bg-crimson-500/10 border border-crimson-500/40 text-crimson-300 text-xs clip-corner-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === "register" && (
                <>
                  <Field
                    icon={<UserIcon className="w-4 h-4" />}
                    label="姓名"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="请输入您的姓名"
                    autoComplete="name"
                  />
                  <Field
                    icon={<Building2 className="w-4 h-4" />}
                    label="公司（可选）"
                    type="text"
                    value={company}
                    onChange={setCompany}
                    placeholder="如：海南槟榔加工厂"
                  />
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                      角色
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { v: "user", label: "设备使用方" },
                          { v: "engineer", label: "运维工程师" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => setRole(opt.v)}
                          className={cn(
                            "py-2.5 text-xs font-medium clip-corner-sm border transition-all",
                            role === opt.v
                              ? "bg-cyan-500/15 border-cyan-500/60 text-cyan-300"
                              : "border-ink-600 text-slate-400 hover:text-slate-200",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Field
                icon={<Mail className="w-4 h-4" />}
                label="邮箱"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@betel.com"
                autoComplete="email"
              />
              <Field
                icon={<KeyRound className="w-4 h-4" />}
                label="密码"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder={mode === "register" ? "至少 6 位" : "请输入密码"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "登录" : "注册并登录"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 演示账号 */}
              <div className="relative pt-2">
                <div className="absolute inset-x-0 top-1/2 h-px bg-ink-700" />
                <div className="relative flex justify-center">
                  <span className="bg-ink-850 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    或
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemo}
                disabled={loading}
                className="btn-ghost w-full !py-3 disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                演示账号一键体验
              </button>

              <p className="text-center text-[11px] text-slate-500 font-mono pt-1">
                {mode === "login" ? (
                  <>
                    还没有账号？
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-cyan-400 hover:text-cyan-300 ml-1"
                    >
                      立即注册
                    </button>
                  </>
                ) : (
                  <>
                    已有账号？
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-cyan-400 hover:text-cyan-300 ml-1"
                    >
                      返回登录
                    </button>
                  </>
                )}
              </p>
            </form>
          </motion.div>

          <Link
            to="/"
            className="block mt-4 text-center text-xs text-slate-500 hover:text-slate-300 font-mono"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

// 受控输入字段
function Field({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pl-9 pr-3 py-2.5 bg-ink-900/60 border border-ink-600 text-slate-100 text-sm placeholder:text-slate-600 clip-corner-sm outline-none transition-colors focus:border-cyan-500/70 focus:bg-ink-900"
        />
      </div>
    </div>
  );
}
