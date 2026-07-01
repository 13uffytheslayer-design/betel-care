// 智能客服匹配引擎：基于设备上下文的关键词匹配 + 知识库检索 + 诊断引导
import { db } from "../db/database";
import type { ChatResponse, DiagnosticOption, Fault, SolutionCard } from "@shared/types";

interface FaultRow {
  id: string;
  category_id: string;
  title: string;
  symptom: string;
  cause: string;
  severity: string;
  frequency: number;
  solution_json: string;
  related_ids_json: string;
}

function mapFault(r: FaultRow): Fault {
  return {
    id: r.id,
    categoryId: r.category_id,
    title: r.title,
    symptom: r.symptom,
    cause: r.cause,
    severity: r.severity as Fault["severity"],
    frequency: r.frequency,
    solution: r.solution_json ? JSON.parse(r.solution_json) : { steps: [], cautions: [] },
    relatedFaultIds: r.related_ids_json ? JSON.parse(r.related_ids_json) : [],
  };
}

function faultToCard(f: Fault): SolutionCard {
  return {
    title: f.title,
    steps: f.solution.steps.map((s) => `${s.title}：${s.detail}`),
    cautions: f.solution.cautions,
    relatedFaultId: f.id,
  };
}

// 诊断引导选项（针对每类设备的常见症状入口）
const DIAGNOSTIC_TREE: Record<string, DiagnosticOption[]> = {
  "seed-sorter": [
    { label: "图像/视觉异常", value: "视觉" },
    { label: "剔除/喷气异常", value: "剔除" },
    { label: "给料/堵料", value: "堵料" },
    { label: "良品率问题", value: "良品率" },
    { label: "HMI/电气", value: "HMI" },
    { label: "气路/气压", value: "气压" },
  ],
  "sheet-sorter": [
    { label: "厚度精度", value: "厚度" },
    { label: "颜色分级", value: "颜色" },
    { label: "传送带跑偏", value: "跑偏" },
    { label: "挡板动作", value: "挡板" },
    { label: "HALCON 报错", value: "HALCON" },
  ],
  "seed-cutter": [
    { label: "切割位置偏", value: "切割位置" },
    { label: "刀片问题", value: "刀片" },
    { label: "去核异常", value: "去核" },
    { label: "伺服报警", value: "伺服" },
    { label: "产能下降", value: "产能" },
    { label: "安全门", value: "安全" },
  ],
};

const GREETING_KEYWORDS = ["你好", "您好", "hi", "hello", "在吗", "帮忙", "咨询"];
const THANKS_KEYWORDS = ["谢谢", "感谢", "thanks", "ok", "好的", "明白"];

export function chat(
  message: string,
  categoryId?: string,
  deviceId?: string,
): ChatResponse {
  const text = message.trim();
  if (!text) {
    return { reply: "请描述您遇到的问题，例如'剔除阀不动作'或'图像偏暗'。" };
  }

  const lower = text.toLowerCase();

  // 打招呼
  if (GREETING_KEYWORDS.some((k) => lower.includes(k)) && text.length < 10) {
    const deviceHint = categoryId ? "已识别您的设备板块。" : "请先选择设备板块，";
    return {
      reply: `${deviceHint}我是槟榔设备智能客服，请描述故障现象（如：剔除阀漏气、视觉图像偏暗、刀片崩刃等），我会为您匹配解决方案。`,
      diagnosticOptions: categoryId ? DIAGNOSTIC_TREE[categoryId] : undefined,
    };
  }

  // 感谢
  if (THANKS_KEYWORDS.some((k) => lower.includes(k)) && text.length < 10) {
    return { reply: "不客气！若问题未解决可点击'转人工'，工程师会跟进处理。祝您产线顺利！" };
  }

  // 未选择设备板块
  if (!categoryId) {
    return {
      reply: "为了精准匹配解决方案，请先在右侧选择您使用的设备板块（槟榔选籽机/选片机/切籽机），或直接描述问题我会尝试识别。",
      diagnosticOptions: undefined,
    };
  }

  // 在该板块故障库中匹配
  const faultRows = db
    .prepare(
      "SELECT id, category_id, title, symptom, cause, severity, frequency, solution_json, related_ids_json FROM faults WHERE category_id = ?",
    )
    .all(categoryId) as FaultRow[];

  const faults = faultRows.map(mapFault);

  // 关键词命中评分
  const scored = faults
    .map((f) => {
      const haystack = (f.title + " " + f.symptom + " " + f.cause).toLowerCase();
      let score = 0;
      // 标题命中权重高
      const titleLower = f.title.toLowerCase();
      const words = lower.split(/[\s,，。、；;]+/).filter((w) => w.length >= 2);
      for (const w of words) {
        if (titleLower.includes(w)) score += 5;
        if (haystack.includes(w)) score += 2;
      }
      // 单字关键词
      const singleKws = ["阀", "气", "刀", "片", "核", "带", "板", "光", "相", "像"];
      for (const k of singleKws) {
        if (lower.includes(k) && haystack.includes(k)) score += 1;
      }
      // 频次加权
      score += Math.min(f.frequency / 20, 3);
      return { fault: f, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // 未命中，提供诊断引导
    return {
      reply: `我在${categoryLabel(categoryId)}知识库中未直接匹配到该问题。请尝试以下诊断方向，或更详细描述故障现象（含报警代码、现象、发生时机）：`,
      diagnosticOptions: DIAGNOSTIC_TREE[categoryId],
      needHuman: true,
    };
  }

  const best = scored[0].fault;
  const card = faultToCard(best);

  // 若还有次优匹配，提示关联
  const others = scored.slice(1, 3).map((s) => s.fault.title);

  const replyParts = [
    `已为您匹配【${categoryLabel(categoryId)}】最相关的解决方案：${best.title}。`,
    `\n\n故障现象：${best.symptom}`,
    `\n可能原因：${best.cause}`,
    `\n\n以下是处理步骤与注意事项，请严格按顺序操作：`,
  ];
  if (others.length > 0) {
    replyParts.push(`\n\n相关问题：${others.join("、")}`);
  }

  return {
    reply: replyParts.join(""),
    solutionCard: card,
    diagnosticOptions: undefined,
    needHuman: false,
  };
}

function categoryLabel(id: string): string {
  const map: Record<string, string> = {
    "seed-sorter": "槟榔选籽机",
    "sheet-sorter": "槟榔选片机",
    "seed-cutter": "槟榔切籽机",
  };
  return map[id] || id;
}

export function getDiagnosticOptions(categoryId: string): DiagnosticOption[] {
  return DIAGNOSTIC_TREE[categoryId] || [];
}
