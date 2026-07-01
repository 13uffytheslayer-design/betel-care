// 智能客服对话页
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Cpu,
  Layers,
  ScanLine,
  Scissors,
  Send,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import HudCard, { HudCardHeader } from "@/components/HudCard";
import { deviceApi, chatApi } from "@/lib/api";
import { useChatContext } from "@/lib/store";
import { categoryLabel, cn } from "@/lib/utils";
import type {
  ChatResponse,
  DeviceCategory,
  DiagnosticOption,
  SolutionCard,
} from "@shared/types";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  solutionCard?: SolutionCard;
  diagnosticOptions?: DiagnosticOption[];
  needHuman?: boolean;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  "seed-sorter": <ScanLine className="w-4 h-4" />,
  "sheet-sorter": <Layers className="w-4 h-4" />,
  "seed-cutter": <Scissors className="w-4 h-4" />,
};

const QUICK_PROMPTS = [
  "剔除阀不动作",
  "视觉图像偏暗",
  "刀片崩刃",
  "伺服报警",
  "传送带跑偏",
  "HALCON 授权过期",
];

export default function Chat() {
  const { categoryId, deviceId, setCategory, setDevice } = useChatContext();
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 加载板块列表
  useEffect(() => {
    deviceApi.categories().then(setCategories).catch(console.error);
  }, []);

  // 初始问候
  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "bot",
        content: categoryId
          ? `已识别设备板块：${categoryLabel[categoryId]}。请描述您遇到的故障现象，例如"剔除阀漏气""图像偏暗""刀片崩刃"，我会为您匹配解决方案。`
          : "您好，我是槟榔设备智能客服。请先在右侧选择您使用的设备板块，然后描述故障现象，我会精准匹配解决方案。",
      },
    ]);
  }, [categoryId]);

  // 自动滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, sending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res: ChatResponse = await chatApi.send({
        message: trimmed,
        categoryId: categoryId || undefined,
        deviceId: deviceId || undefined,
      });
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: res.reply,
        solutionCard: res.solutionCard,
        diagnosticOptions: res.diagnosticOptions,
        needHuman: res.needHuman,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          content: "抱歉，服务暂时不可用，请稍后重试或拨打售后热线 400-xxx-xxxx。",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onDiagnosticClick = (opt: DiagnosticOption) => {
    send(`我遇到的问题与"${opt.label}"相关`);
  };

  return (
    <PageShell showGrid={false}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-9rem)]">
        {/* 对话主区 */}
        <div className="lg:col-span-2 flex flex-col">
          <HudCard className="flex-1 flex flex-col overflow-hidden">
            {/* 对话头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700 bg-ink-900/40">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 grid place-items-center bg-cyan-500/15 text-cyan-400 clip-corner-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-jade-500 rounded-full animate-breathe" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    智能客服
                  </div>
                  <div className="text-[10px] font-mono text-jade-400">
                    ● 在线 · {categoryId ? categoryLabel[categoryId] : "未选板块"}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {messages.length} 条消息
              </span>
            </div>

            {/* 消息流 */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onDiagnosticClick={onDiagnosticClick}
                  />
                ))}
              </AnimatePresence>

              {sending && (
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-7 h-7 grid place-items-center bg-ink-800 clip-corner-sm">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-breathe" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-breathe" style={{ animationDelay: "200ms" }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-breathe" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* 快捷提问 */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    disabled={sending}
                    className="px-3 py-1.5 text-xs text-slate-300 bg-ink-800 border border-ink-700 clip-corner-sm hover:border-cyan-500/50 hover:text-cyan-300 transition-colors disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* 输入框 */}
            <div className="p-3 border-t border-ink-700 bg-ink-900/40">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="描述故障现象，按 Enter 发送..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 bg-ink-850 border border-ink-700 clip-corner-sm text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                  onClick={() => send(input)}
                  disabled={sending || !input.trim()}
                  className="btn-primary !px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </HudCard>
        </div>

        {/* 右侧上下文面板 */}
        <aside className="lg:col-span-1 space-y-4 overflow-y-auto scrollbar-thin">
          {/* 设备板块选择 */}
          <HudCard>
            <HudCardHeader
              title="设备上下文"
              icon={<Cpu className="w-4 h-4" />}
              right={
                categoryId && (
                  <button
                    onClick={() => {
                      setCategory(null);
                      setDevice(null);
                    }}
                    className="text-xs text-slate-500 hover:text-crimson-400 font-mono"
                  >
                    清除
                  </button>
                )
              }
            />
            <div className="p-3 space-y-2">
              {categories.map((cat) => {
                const active = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors clip-corner-sm text-left border",
                      active
                        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-ink-800/60 border-transparent",
                    )}
                  >
                    <span className={active ? "text-cyan-400" : "text-slate-500"}>
                      {CATEGORY_ICON[cat.id]}
                    </span>
                    <span className="flex-1 truncate">{cat.name}</span>
                    {active && (
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                );
              })}
              {!categoryId && (
                <p className="text-xs text-slate-500 px-2 pt-1">
                  选择板块后，客服将基于该设备知识库精准匹配
                </p>
              )}
            </div>
          </HudCard>

          {/* 当前会话状态 */}
          {categoryId && (
            <HudCard className="p-4">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
                当前会话
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">设备板块</span>
                  <span className="text-sm text-cyan-300">
                    {categoryLabel[categoryId]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">知识库方案</span>
                  <span className="text-sm font-mono text-slate-200">
                    {categoryId === "seed-sorter" ? 6 : categoryId === "sheet-sorter" ? 5 : 6}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">会话状态</span>
                  <span className="text-xs text-jade-400 flex items-center gap-1">
                    <span className="status-online" /> 进行中
                  </span>
                </div>
              </div>
              <Link
                to="/feedback"
                className="btn-ghost w-full mt-4 !py-2 text-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                未解决？提交反馈
              </Link>
            </HudCard>
          )}
        </aside>
      </div>
    </PageShell>
  );
}

// 消息气泡
function MessageBubble({
  msg,
  onDiagnosticClick,
}: {
  msg: Message;
  onDiagnosticClick: (opt: DiagnosticOption) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "w-7 h-7 grid place-items-center clip-corner-sm shrink-0",
          isUser
            ? "bg-cyan-500/15 text-cyan-300"
            : "bg-ink-800 text-slate-400",
        )}
      >
        {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={cn("max-w-[80%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed clip-corner-sm border",
            isUser
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-50"
              : "bg-ink-850 border-ink-700 text-slate-200",
          )}
        >
          {msg.content.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1.5" : ""}>
              {line}
            </p>
          ))}
        </div>

        {/* 解决方案卡片 */}
        {msg.solutionCard && (
          <SolutionCardView card={msg.solutionCard} />
        )}

        {/* 诊断引导按钮 */}
        {msg.diagnosticOptions && msg.diagnosticOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {msg.diagnosticOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDiagnosticClick(opt)}
                className="px-3 py-1.5 text-xs text-cyan-300 bg-cyan-500/5 border border-cyan-500/30 clip-corner-sm hover:bg-cyan-500/15 hover:border-cyan-500/50 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* 转人工提示 */}
        {msg.needHuman && (
          <Link
            to="/feedback"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/40 clip-corner-sm hover:bg-amber-500/20 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            需转人工处理 · 提交工单
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// 解决方案卡片视图
function SolutionCardView({ card }: { card: SolutionCard }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="bg-ink-900/60 border border-cyan-500/30 clip-corner overflow-hidden"
    >
      <div className="px-3.5 py-2.5 bg-cyan-500/10 border-b border-cyan-500/30 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-sm font-semibold text-cyan-200">
          解决方案 · {card.title}
        </span>
      </div>
      <div className="p-3.5 space-y-3">
        {/* 步骤 */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
            处理步骤
          </div>
          <ol className="space-y-2">
            {card.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-5 h-5 grid place-items-center bg-cyan-500/15 text-cyan-400 text-[10px] font-mono font-bold clip-corner-sm shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-300 leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* 注意事项 */}
        {card.cautions.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/30 clip-corner-sm p-2.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              注意事项
            </div>
            <ul className="space-y-1">
              {card.cautions.map((c, i) => (
                <li key={i} className="text-xs text-amber-200/90 leading-relaxed flex gap-1.5">
                  <span className="text-amber-500">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {card.relatedFaultId && (
          <Link
            to={`/knowledge/${card.relatedFaultId}`}
            className="block text-center text-xs text-cyan-400 hover:text-cyan-300 font-mono pt-1"
          >
            查看完整知识库详情 →
          </Link>
        )}
      </div>
    </motion.div>
  );
}
