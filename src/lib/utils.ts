// 通用工具函数
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 严重度映射
export const severityConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: "低",
    color: "text-jade-400",
    bg: "bg-jade-500/10",
    border: "border-jade-500/40",
  },
  medium: {
    label: "中",
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/40",
  },
  high: {
    label: "高",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
  },
  critical: {
    label: "紧急",
    color: "text-crimson-400",
    bg: "bg-crimson-500/10",
    border: "border-crimson-500/40",
  },
};

export const statusConfig: Record<
  string,
  { label: string; dot: string; color: string }
> = {
  online: { label: "在线", dot: "status-online", color: "text-jade-400" },
  warning: { label: "告警", dot: "status-warning", color: "text-amber-400" },
  offline: { label: "离线", dot: "status-offline", color: "text-slate-500" },
};

export const categoryLabel: Record<string, string> = {
  "seed-sorter": "槟榔选籽机",
  "sheet-sorter": "槟榔选片机",
  "seed-cutter": "槟榔切籽机",
};

// 数字滚动动画 hook
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = 0;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// 格式化数字
export function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

// 格式化日期
export function formatDate(s: string): string {
  const d = new Date(s.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return s;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
