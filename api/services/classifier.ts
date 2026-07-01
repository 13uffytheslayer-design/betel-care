// 反馈 NLP 分类引擎：基于关键词词典的三维分类（问题类别 × 严重度）
import type { Severity } from "@shared/types";

interface ClassifiedResult {
  problemCategory: string;
  severity: Severity;
}

// 问题类别关键词词典
const CATEGORY_RULES: Array<{
  category: string;
  keywords: string[];
  severity: Severity;
}> = [
  {
    category: "气路故障",
    keywords: ["剔除阀", "电磁阀", "气压", "压缩空气", "气缸", "喷嘴", "漏气", "气源", "阀岛", "冷干机", "滤芯", "白雾", "水渍"],
    severity: "high",
  },
  {
    category: "视觉故障",
    keywords: ["视觉", "相机", "图像", "光源", "曝光", "镜头", "良品率", "误剔", "色差", "颜色", "分级错误", "白平衡", "HALCON", "授权", "模型", "识别", "标定", "模板"],
    severity: "high",
  },
  {
    category: "机械故障",
    keywords: ["振动", "给料", "堵料", "传送带", "跑偏", "刀片", "崩刃", "切割", "去核", "夹爪", "挡板", "翻板", "弹簧", "托辊", "毛刺", "卡死", "卡阻", "堵料"],
    severity: "medium",
  },
  {
    category: "电气故障",
    keywords: ["伺服", "驱动器", "报警", "电机", "编码器", "继电器", "PLC", "HMI", "触摸屏", "死机", "卡顿", "电源", "电压", "绝缘", "E-0"],
    severity: "high",
  },
  {
    category: "安全故障",
    keywords: ["安全门", "联锁", "急停", "行程开关", "安全"],
    severity: "critical",
  },
  {
    category: "软件故障",
    keywords: ["网络", "数据丢失", "断网", "缓存", "崩溃", "OOM", "内存", "磁盘", "程序"],
    severity: "medium",
  },
  {
    category: "性能问题",
    keywords: ["产能", "下降", "节拍", "速度", "稼动率", "响应慢", "延迟"],
    severity: "low",
  },
  {
    category: "可用性问题",
    keywords: ["字体", "操作", "界面", "按钮", "手套", "易用", "难用"],
    severity: "low",
  },
  {
    category: "文档问题",
    keywords: ["说明书", "文档", "手册", "教程"],
    severity: "low",
  },
  {
    category: "功能建议",
    keywords: ["建议", "希望", "能否", "增加", "支持", "希望", "想要", "可以", "App", "移动", "提醒", "日历", "预设", "追溯"],
    severity: "low",
  },
];

// 严重度提升规则：含紧急关键词则升级
const SEVERITY_BOOST: Array<{ keywords: string[]; severity: Severity }> = [
  { keywords: ["立即", "紧急", "停机", "无法运行", "完全失效", "危险", "安全隐患"], severity: "critical" },
  { keywords: ["严重", "大量", "频繁", "持续", "无法", "失效"], severity: "high" },
];

function severityRank(s: Severity): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[s];
}

export function classifyFeedback(text: string, _categoryId: string): ClassifiedResult {
  const lower = text.toLowerCase();

  // 统计每个类别的命中数
  const scores: Array<{ category: string; severity: Severity; hits: number }> = [];
  for (const rule of CATEGORY_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) hits++;
    }
    if (hits > 0) {
      scores.push({ category: rule.category, severity: rule.severity, hits });
    }
  }

  // 取命中数最高的类别（同分取严重度更高）
  scores.sort((a, b) => b.hits - a.hits || severityRank(b.severity) - severityRank(a.severity));

  let problemCategory = "其他问题";
  let severity: Severity = "low";

  if (scores.length > 0) {
    problemCategory = scores[0].category;
    severity = scores[0].severity;
  }

  // 严重度提升
  for (const boost of SEVERITY_BOOST) {
    for (const kw of boost.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        if (severityRank(boost.severity) > severityRank(severity)) {
          severity = boost.severity;
        }
        break;
      }
    }
  }

  return { problemCategory, severity };
}

// 预览分类（不写入，供表单实时预览）
export function previewClassify(text: string, categoryId: string): ClassifiedResult {
  return classifyFeedback(text, categoryId);
}
