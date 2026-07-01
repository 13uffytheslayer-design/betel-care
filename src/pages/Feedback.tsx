// 反馈中心：提交反馈 + 我的反馈（统计看板已迁移至管理员后台）
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MessageSquarePlus, Send } from "lucide-react";
import PageShell from "@/components/PageShell";
import HudCard from "@/components/HudCard";
import { SeverityTag } from "@/components/Status";
import { feedbackApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { categoryLabel, cn, formatDate } from "@/lib/utils";
import type { Feedback } from "@shared/types";

type Tab = "submit" | "mine";

export default function FeedbackCenter() {
  const [tab, setTab] = useState<Tab>("submit");
  const { user } = useAuthStore();

  return (
    <PageShell
      title="反馈中心"
      subtitle="FEEDBACK CENTER · 问题反馈 · 分类沉淀"
    >
      {/* Tab 切换：普通用户仅可见 提交反馈 / 我的反馈；统计看板已迁移至管理后台 */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { id: "submit" as Tab, label: "提交反馈", icon: MessageSquarePlus },
          { id: "mine" as Tab, label: "我的反馈", icon: Clock },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium clip-corner-sm border transition-all",
                active
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                  : "border-ink-700 text-slate-400 hover:text-slate-200 hover:border-ink-600",
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "submit" && (
        <SubmitForm onDone={() => setTab("mine")} loggedIn={!!user} />
      )}
      {tab === "mine" && <MineView loggedIn={!!user} />}
    </PageShell>
  );
}

// ===== 提交表单 =====
function SubmitForm({ onDone, loggedIn }: { onDone: () => void; loggedIn: boolean }) {
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"exception" | "suggestion">("exception");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<{ problemCategory: string; severity: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 实时预览分类
  useEffect(() => {
    if (!categoryId || !title) {
      setPreview(null);
      return;
    }
    const timer = setTimeout(() => {
      feedbackApi
        .previewClassify(`${title} ${description}`, categoryId)
        .then(setPreview)
        .catch(() => setPreview(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [title, description, categoryId]);

  const submit = async () => {
    setError("");
    if (!categoryId || !title.trim() || !description.trim()) {
      setError("设备板块、标题、描述为必填");
      return;
    }
    setSubmitting(true);
    try {
      await feedbackApi.create({
        categoryId,
        type,
        title: title.trim(),
        description: description.trim(),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <HudCard className="lg:col-span-2 p-5">
        {!loggedIn && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 clip-corner-sm text-xs text-amber-200">
            提示：未登录状态下提交的反馈将无法在"我的反馈"中追踪，建议先登录。
          </div>
        )}
        <div className="space-y-4">
          {/* 设备板块 */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">
              设备板块 *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "seed-sorter", name: "选籽机" },
                { id: "sheet-sorter", name: "选片机" },
                { id: "seed-cutter", name: "切籽机" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "px-3 py-2.5 text-sm clip-corner-sm border transition-all",
                    categoryId === c.id
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                      : "border-ink-700 text-slate-400 hover:border-ink-600",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">
              反馈类型 *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType("exception")}
                className={cn(
                  "px-3 py-2.5 text-sm clip-corner-sm border transition-all",
                  type === "exception"
                    ? "bg-crimson-500/10 border-crimson-500/40 text-crimson-300"
                    : "border-ink-700 text-slate-400 hover:border-ink-600",
                )}
              >
                异常问题
              </button>
              <button
                onClick={() => setType("suggestion")}
                className={cn(
                  "px-3 py-2.5 text-sm clip-corner-sm border transition-all",
                  type === "suggestion"
                    ? "bg-jade-500/10 border-jade-500/40 text-jade-300"
                    : "border-ink-700 text-slate-400 hover:border-ink-600",
                )}
              >
                功能建议
              </button>
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">
              标题 *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简要概括问题，如：剔除阀漏气导致瘪籽混入"
              className="w-full px-3 py-2.5 bg-ink-900 border border-ink-700 clip-corner-sm text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">
              详细描述 *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="请描述：故障现象、发生时机、报警代码、已尝试的操作..."
              className="w-full px-3 py-2.5 bg-ink-900 border border-ink-700 clip-corner-sm text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none resize-none"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-crimson-500/10 border border-crimson-500/30 clip-corner-sm text-xs text-crimson-300">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            {submitting ? "提交中..." : "提交反馈"}
          </button>
        </div>
      </HudCard>

      {/* 右侧预览 */}
      <aside className="lg:col-span-1">
        <HudCard className="p-4 sticky top-24">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
            智能分类预览
          </div>
          {!preview ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              填写标题与描述后，系统将基于 NLP 关键词词典实时预判
              <span className="text-cyan-400">问题类别</span>与
              <span className="text-amber-400">严重度</span>。
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">
                  预判类别
                </div>
                <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 clip-corner-sm">
                  <span className="text-sm text-cyan-200 font-semibold">
                    {preview.problemCategory}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">
                  预判严重度
                </div>
                <div>
                  <SeverityTag severity={preview.severity} />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-ink-700/60">
                ※ 提交后将由管理员审核归类，高频问题将沉淀至故障知识库。
              </p>
            </div>
          )}
        </HudCard>
      </aside>
    </div>
  );
}

// ===== 我的反馈（登录用户）=====
function MineView({ loggedIn }: { loggedIn: boolean }) {
  const [list, setList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    feedbackApi
      .mine()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <HudCard className="p-12 text-center">
        <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 mb-4">登录后可查看您提交的反馈及官方回复</p>
        <Link to="/login" className="btn-primary !px-5 !py-2 text-sm inline-flex">
          去登录
        </Link>
      </HudCard>
    );
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <HudCard className="p-12 text-center">
        <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">您还没有提交过反馈</p>
      </HudCard>
    );
  }

  const statusCfg: Record<string, { label: string; color: string }> = {
    pending: { label: "待处理", color: "text-amber-400" },
    processing: { label: "处理中", color: "text-cyan-400" },
    resolved: { label: "已解决", color: "text-jade-400" },
  };

  return (
    <div className="space-y-3">
      {list.map((fb, idx) => {
        const st = statusCfg[fb.status] || statusCfg.pending;
        return (
          <motion.div
            key={fb.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.04, 0.3) }}
          >
            <HudCard className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="chip">{categoryLabel[fb.categoryId]}</span>
                    <span
                      className={cn(
                        "chip",
                        fb.type === "exception"
                          ? "border-crimson-500/40 text-crimson-300"
                          : "border-jade-500/40 text-jade-300",
                      )}
                    >
                      {fb.type === "exception" ? "异常" : "建议"}
                    </span>
                    <SeverityTag severity={fb.severity} />
                    <span className="text-[10px] font-mono text-slate-500">
                      {fb.problemCategory}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {fb.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {fb.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className={cn("text-xs font-mono", st.color)}>
                    ● {st.label}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {formatDate(fb.createdAt)}
                  </div>
                </div>
              </div>
              {fb.reply && (
                <div className="mt-2 p-2.5 bg-ink-900/60 border border-ink-700/60 clip-corner-sm">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1">
                    官方回复
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {fb.reply}
                  </p>
                </div>
              )}
            </HudCard>
          </motion.div>
        );
      })}
    </div>
  );
}
