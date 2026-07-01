// 反馈样本种子数据（槟榔产业场景化）
export interface FeedbackSeed {
  id: string;
  user_id: number | null;
  user_name: string;
  category_id: string;
  device_id: string | null;
  type: "exception" | "suggestion";
  title: string;
  description: string;
  problem_category: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "processing" | "resolved";
  reply: string | null;
  images_json: string | null;
  created_at: string;
}

// 生成最近 30 天的日期
function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(8 + (d % 12), (d * 7) % 60, 0, 0);
  return date.toISOString().replace("T", " ").substring(0, 19);
}

export const feedbackSeed: FeedbackSeed[] = [
  // 选籽机异常反馈
  {
    id: "fb-001", user_id: null, user_name: "海南万宁槟榔厂-陈某", category_id: "seed-sorter",
    device_id: "ss-2000", type: "exception",
    title: "剔除阀漏气导致瘪籽混入良品",
    description: "今早开机后良品仓出现大量瘪籽，检查发现 3 号剔除阀不动作，气压表显示 0.45MPa。",
    problem_category: "气路故障", severity: "high", status: "resolved",
    reply: "已上门更换 3 号电磁阀线圈，气压调至 0.6MPa，良品率恢复 99.3%。",
    images_json: null, created_at: daysAgo(2),
  },
  {
    id: "fb-002", user_id: null, user_name: "海南万宁槟榔厂-陈某", category_id: "seed-sorter",
    device_id: "ss-1200", type: "exception",
    title: "视觉相机图像偏暗",
    description: "BNS-XZ1200 屏幕图像整体偏暗，槟榔籽轮廓看不清，已尝试重启无效。",
    problem_category: "视觉故障", severity: "high", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(5),
  },
  {
    id: "fb-003", user_id: null, user_name: "湖南湘潭加工厂-李某", category_id: "seed-sorter",
    device_id: "ss-800", type: "suggestion",
    title: "希望增加气压实时监控报警",
    description: "建议在 HMI 主界面增加压缩空气压力实时显示，低于 0.5MPa 时自动报警，避免漏剔问题发现不及时。",
    problem_category: "功能建议", severity: "low", status: "processing",
    reply: "已记录至产品需求池，下个版本（v2.4）将加入气压实时曲线与低报警功能。",
    images_json: null, created_at: daysAgo(8),
  },
  {
    id: "fb-004", user_id: null, user_name: "湖南湘潭加工厂-李某", category_id: "seed-sorter",
    device_id: "ss-800", type: "exception",
    title: "振动给料器堵料",
    description: "云南批次槟榔籽含水率高，振动盘频繁堵料，单层化失败。",
    problem_category: "机械故障", severity: "medium", status: "resolved",
    reply: "已指导客户前置烘干 30 分钟，含水率从 16% 降至 11%，振幅调至 72% 后正常。",
    images_json: null, created_at: daysAgo(12),
  },
  {
    id: "fb-005", user_id: null, user_name: "广东汕头工厂-黄某", category_id: "seed-sorter",
    device_id: "ss-2000", type: "exception",
    title: "良品率突然下降到 90%",
    description: "更换原料产地后良品率从 99% 跌到 90%，废品仓混入大量饱满籽。",
    problem_category: "视觉故障", severity: "high", status: "resolved",
    reply: "工程师上门重新采集 200 颗样本训练模型，瘪籽阈值从 0.65 调至 0.58，良品率恢复 98.8%。",
    images_json: null, created_at: daysAgo(15),
  },
  {
    id: "fb-006", user_id: null, user_name: "广东汕头工厂-黄某", category_id: "seed-sorter",
    device_id: "ss-3000", type: "exception",
    title: "HMI 触摸屏死机",
    description: "BNS-XZ3000 触摸屏点击无响应，已重启 2 次仍卡顿。",
    problem_category: "电气故障", severity: "medium", status: "resolved",
    reply: "远程指导长按复位孔 5 秒软重启，并加装防潮加热器，问题未再复现。",
    images_json: null, created_at: daysAgo(18),
  },
  {
    id: "fb-007", user_id: null, user_name: "海南琼海加工厂-王某", category_id: "seed-sorter",
    device_id: "ss-1200", type: "suggestion",
    title: "建议增加原料产地参数预设",
    description: "海南/云南/进口槟榔参数差异大，每次换产地都要重新调，建议预设产地参数库一键切换。",
    problem_category: "功能建议", severity: "low", status: "resolved",
    reply: "v2.4 版本新增'原料预设'功能，已支持海南/云南/印度尼西亚三地产地参数库。",
    images_json: null, created_at: daysAgo(22),
  },
  {
    id: "fb-008", user_id: null, user_name: "海南琼海加工厂-王某", category_id: "seed-sorter",
    device_id: "ss-2000", type: "exception",
    title: "压缩空气含水量高导致误判",
    description: "喷嘴喷出白雾，槟榔籽表面有水渍，分选精度下降。",
    problem_category: "气路故障", severity: "medium", status: "resolved",
    reply: "更换三级过滤器滤芯，冷干机蒸发温度从 12℃ 降至 6℃，问题解决。",
    images_json: null, created_at: daysAgo(25),
  },

  // 选片机异常反馈
  {
    id: "fb-009", user_id: null, user_name: "湖南益阳槟榔厂-周某", category_id: "sheet-sorter",
    device_id: "sh-500", type: "exception",
    title: "片厚分级精度下降",
    description: "A/B/C 三级分档混乱，厚度偏差 ±0.3mm，客户投诉分级不准。",
    problem_category: "视觉故障", severity: "high", status: "resolved",
    reply: "执行零点校准 + 满量程多点校准，R² 达 0.9995，精度恢复 ±0.1mm。",
    images_json: null, created_at: daysAgo(3),
  },
  {
    id: "fb-010", user_id: null, user_name: "湖南益阳槟榔厂-周某", category_id: "sheet-sorter",
    device_id: "sh-300", type: "exception",
    title: "颜色分级错误",
    description: "深色槟榔片被分入 A 级，浅色片被误判为瑕疵。",
    problem_category: "视觉故障", severity: "high", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(6),
  },
  {
    id: "fb-011", user_id: null, user_name: "海南文昌加工厂-林某", category_id: "sheet-sorter",
    device_id: "sh-500", type: "exception",
    title: "传送带跑偏堆积",
    description: "传送带向右侧偏移，槟榔片堆积边缘，传感器测厚位置偏移。",
    problem_category: "机械故障", severity: "medium", status: "resolved",
    reply: "调整张紧轮右侧螺栓 1/4 圈，运行 1 分钟后跑偏归零，托辊无异常。",
    images_json: null, created_at: daysAgo(9),
  },
  {
    id: "fb-012", user_id: null, user_name: "海南文昌加工厂-林某", category_id: "sheet-sorter",
    device_id: "sh-300", type: "exception",
    title: "分级挡板动作迟缓",
    description: "挡板翻板延迟超过 100ms，槟榔片落入错误分级仓。",
    problem_category: "电气故障", severity: "high", status: "resolved",
    reply: "伺服响应时间从 120ms 优化至 45ms，PLC 扫描周期 3ms，问题解决。",
    images_json: null, created_at: daysAgo(13),
  },
  {
    id: "fb-013", user_id: null, user_name: "海南文昌加工厂-林某", category_id: "sheet-sorter",
    device_id: "sh-200", type: "exception",
    title: "HALCON 授权过期",
    description: "HMI 报 Halcon License Expired，视觉功能完全失效。",
    problem_category: "软件故障", severity: "critical", status: "resolved",
    reply: "已远程更新授权文件，并同步工控机 NTP 时间，授权有效期至 2027-06-30。",
    images_json: null, created_at: daysAgo(17),
  },
  {
    id: "fb-014", user_id: null, user_name: "湖南长沙工厂-刘某", category_id: "sheet-sorter",
    device_id: "sh-500", type: "suggestion",
    title: "建议增加 HALCON 缓存自动清理",
    description: "HALCON 临时图像占满磁盘导致崩溃，建议增加自动清理与磁盘占用预警。",
    problem_category: "功能建议", severity: "medium", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(20),
  },
  {
    id: "fb-015", user_id: null, user_name: "湖南长沙工厂-刘某", category_id: "sheet-sorter",
    device_id: "sh-300", type: "exception",
    title: "槟榔糖渍污染传送带",
    description: "槟榔片表面糖渍粘在传送带上，影响厚度检测精度。",
    problem_category: "机械故障", severity: "low", status: "resolved",
    reply: "已指导每班次用无尘布蘸温水擦拭传送带，并增加预清洁毛刷工位。",
    images_json: null, created_at: daysAgo(24),
  },

  // 切籽机异常反馈
  {
    id: "fb-016", user_id: null, user_name: "海南三亚槟榔厂-吴某", category_id: "seed-cutter",
    device_id: "ct-180", type: "exception",
    title: "切割位置偏移",
    description: "槟榔籽切割面偏离中线，出现大小头，影响后续去核。",
    problem_category: "机械故障", severity: "high", status: "resolved",
    reply: "执行伺服回零 + 夹爪更换 + 对中传感器标定，切割位置偏差 ±0.05mm 内。",
    images_json: null, created_at: daysAgo(1),
  },
  {
    id: "fb-017", user_id: null, user_name: "海南三亚槟榔厂-吴某", category_id: "seed-cutter",
    device_id: "ct-120", type: "exception",
    title: "刀片崩刃",
    description: "切面出现毛刺，刀片检测报警，刀片使用 35 万次。",
    problem_category: "机械故障", severity: "high", status: "resolved",
    reply: "已更换新刀片，发现槟榔烘干过度硬度达 85HA，已指导回潮处理至 70HA。",
    images_json: null, created_at: daysAgo(4),
  },
  {
    id: "fb-018", user_id: null, user_name: "海南三亚槟榔厂-吴某", category_id: "seed-cutter",
    device_id: "ct-180", type: "exception",
    title: "去核工位卡死",
    description: "去核针卡死，槟榔核未剔除混入成品片。",
    problem_category: "机械故障", severity: "medium", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(7),
  },
  {
    id: "fb-019", user_id: null, user_name: "云南西双版纳厂-赵某", category_id: "seed-cutter",
    device_id: "ct-120", type: "exception",
    title: "伺服驱动器 E-03 报警",
    description: "HMI 报伺服 E-03 过流，设备停机，复位 2 次无效。",
    problem_category: "电气故障", severity: "critical", status: "resolved",
    reply: "工程师现场检查电机绝缘降至 5MΩ（应 ≥ 50MΩ），更换伺服电机后恢复。",
    images_json: null, created_at: daysAgo(10),
  },
  {
    id: "fb-020", user_id: null, user_name: "云南西双版纳厂-赵某", category_id: "seed-cutter",
    device_id: "ct-80", type: "exception",
    title: "切籽产能下降",
    description: "产量从 80kg/h 降至 55kg/h，无明显报警。",
    problem_category: "性能问题", severity: "low", status: "resolved",
    reply: "夹爪节拍 1.2s 优化至 0.7s，振动给料振幅调至 72%，产能恢复 78kg/h。",
    images_json: null, created_at: daysAgo(14),
  },
  {
    id: "fb-021", user_id: null, user_name: "云南西双版纳厂-赵某", category_id: "seed-cutter",
    device_id: "ct-180", type: "suggestion",
    title: "建议增加刀片寿命预警",
    description: "刀片寿命到期才发现崩刃，建议剩余 5 万次时预警提示备货。",
    problem_category: "功能建议", severity: "low", status: "resolved",
    reply: "v2.4 版本已新增刀片寿命预警，剩余 5 万次自动推送备货提醒。",
    images_json: null, created_at: daysAgo(19),
  },
  {
    id: "fb-022", user_id: null, user_name: "湖南株洲加工厂-孙某", category_id: "seed-cutter",
    device_id: "ct-120", type: "exception",
    title: "安全门联锁失效",
    description: "打开安全门后设备未停机，存在安全隐患。",
    problem_category: "安全故障", severity: "critical", status: "resolved",
    reply: "立即停机，更换双触点冗余行程开关与安全继电器，3 次测试通过。",
    images_json: null, created_at: daysAgo(23),
  },
  {
    id: "fb-023", user_id: null, user_name: "湖南株洲加工厂-孙某", category_id: "seed-cutter",
    device_id: "ct-180", type: "suggestion",
    title: "建议增加海南/云南籽型预设",
    description: "海南籽与云南籽型差异大，每次切换需重新训练，建议预设籽型库。",
    problem_category: "功能建议", severity: "medium", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(26),
  },

  // 综合建议与异常
  {
    id: "fb-024", user_id: null, user_name: "海南万宁槟榔厂-陈某", category_id: "seed-sorter",
    device_id: null, type: "suggestion",
    title: "希望增加移动端 App 远程查看",
    description: "建议开发手机 App，可远程查看设备状态、报警记录与产线稼动率。",
    problem_category: "功能建议", severity: "low", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(11),
  },
  {
    id: "fb-025", user_id: null, user_name: "湖南益阳槟榔厂-周某", category_id: "sheet-sorter",
    device_id: null, type: "suggestion",
    title: "希望提供保养日历提醒",
    description: "建议设备保养按周期推送提醒，避免滤芯/刀片过期使用。",
    problem_category: "功能建议", severity: "low", status: "resolved",
    reply: "v2.4 已上线保养日历功能，按设备自动生成保养计划并推送提醒。",
    images_json: null, created_at: daysAgo(16),
  },
  {
    id: "fb-026", user_id: null, user_name: "海南三亚槟榔厂-吴某", category_id: "seed-cutter",
    device_id: null, type: "suggestion",
    title: "建议增加产线稼动率看板",
    description: "希望设备联动展示整条槟榔产线的稼动率、OEE、停机时长。",
    problem_category: "功能建议", severity: "medium", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(21),
  },
  {
    id: "fb-027", user_id: null, user_name: "广东汕头工厂-黄某", category_id: "seed-sorter",
    device_id: "ss-2000", type: "exception",
    title: "原料批次追溯困难",
    description: "出现质量问题难以追溯原料批次，建议增加批次录入与追溯功能。",
    problem_category: "功能建议", severity: "medium", status: "resolved",
    reply: "v2.4 新增批次管理模块，扫码录入产地/批次/含水率，可双向追溯。",
    images_json: null, created_at: daysAgo(27),
  },
  {
    id: "fb-028", user_id: null, user_name: "海南文昌加工厂-林某", category_id: "sheet-sorter",
    device_id: "sh-500", type: "exception",
    title: "网络断开后数据丢失",
    description: "工厂网络不稳定，断网期间报警数据丢失，希望增加本地缓存。",
    problem_category: "软件故障", severity: "medium", status: "processing",
    reply: null, images_json: null, created_at: daysAgo(28),
  },
  {
    id: "fb-029", user_id: null, user_name: "湖南长沙工厂-刘某", category_id: "sheet-sorter",
    device_id: "sh-300", type: "exception",
    title: "HMI 界面字体过小",
    description: "操作工人反映 HMI 字体过小，戴手套难以操作按钮。",
    problem_category: "可用性问题", severity: "low", status: "resolved",
    reply: "v2.4 提供'大字模式'开关，按钮尺寸放大 1.5 倍，便于戴手套操作。",
    images_json: null, created_at: daysAgo(29),
  },
  {
    id: "fb-030", user_id: null, user_name: "云南西双版纳厂-赵某", category_id: "seed-cutter",
    device_id: "ct-120", type: "exception",
    title: "设备说明书更新不及时",
    description: "v2.3 升级后说明书未同步，操作工按旧版操作导致参数错误。",
    problem_category: "文档问题", severity: "low", status: "resolved",
    reply: "已更新说明书至 v2.4 版本，HMI 内嵌电子说明书并随版本自动更新。",
    images_json: null, created_at: daysAgo(30),
  },
];
