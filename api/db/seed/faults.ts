// 槟榔设备故障知识库种子数据
export interface FaultSeed {
  id: string;
  category_id: string;
  title: string;
  symptom: string;
  cause: string;
  severity: "low" | "medium" | "high" | "critical";
  frequency: number;
  solution_json: string;
  related_ids_json: string;
}

interface SolStep {
  order: number;
  title: string;
  detail: string;
}
interface Sol {
  steps: SolStep[];
  cautions: string[];
}
const sol = (s: Sol) => JSON.stringify(s);
const rel = (ids: string[]) => JSON.stringify(ids);

export const faultSeed: FaultSeed[] = [
  // ===== 槟榔选籽机故障 =====
  {
    id: "ss-f01",
    category_id: "seed-sorter",
    title: "视觉相机图像发暗/曝光不足",
    symptom:
      "选籽机分选界面实时图像整体偏暗，槟榔籽轮廓难以辨识，剔除阀频繁误动作或不动。",
    cause:
      "光源衰减或污染、相机曝光参数漂移、镜头保护罩结露、相机电源电压不稳。",
    severity: "high",
    frequency: 38,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "检查光源亮度",
          detail:
            "进入 HMI → 视觉调试 → 光源控制，确认 LED 条光源亮度 ≥ 85%。若衰减明显，安排更换光源模组。",
        },
        {
          order: 2,
          title: "清洁镜头与保护罩",
          detail:
            "停机断电后用无尘布蘸取无水乙醇擦拭相机镜头及保护罩，检查是否有结露或槟榔汁液残留。",
        },
        {
          order: 3,
          title: "校正曝光参数",
          detail:
            "在视觉调试界面将曝光时间从默认 8000μs 上调至 12000-15000μs，增益 ≤ 12dB，保存后重新标定白平衡。",
        },
        {
          order: 4,
          title: "测量电源电压",
          detail: "用万用表测量相机 24V 供电，波动范围应在 23.5-24.5V，异常则检查开关电源。",
        },
      ],
      cautions: [
        "清洁镜头前必须断电，防止静电损伤 CMOS",
        "曝光参数修改后必须重新执行白平衡与畸变标定",
        "槟榔汁液具有黏性，残留会腐蚀镀膜，需及时清理",
      ],
    }),
    related_ids_json: rel(["ss-f02", "ss-f04"]),
  },
  {
    id: "ss-f02",
    category_id: "seed-sorter",
    title: "剔除阀不动作/漏剔除",
    symptom:
      "识别到瘪籽/霉变籽但高压喷嘴未喷气，或喷气延迟明显，导致不良籽混入良品仓。",
    cause:
      "压缩空气压力不足、电磁阀线圈烧毁、阀岛接线松动、PLC 输出点损坏。",
    severity: "critical",
    frequency: 52,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "检查气压",
          detail:
            "查看进气压力表，工作压力必须 0.5-0.7 MPa。低于 0.5 MPa 检查空压机与冷干机。",
        },
        {
          order: 2,
          title: "测试电磁阀",
          detail:
            "在 HMI 阀测试界面逐路点动，听是否有'咔哒'吸合声。无声则用万用表测线圈阻值（正常 26-32Ω）。",
        },
        {
          order: 3,
          title: "检查阀岛接线",
          detail: "断电后检查阀岛航空插头是否松动、氧化，重新插拔并紧固。",
        },
        {
          order: 4,
          title: "排查 PLC 输出",
          detail:
            "若阀线圈正常但无信号，进入 PLC 在线监控对应输出点 Q，强制 ON 测试，无响应则更换输出模块。",
        },
      ],
      cautions: [
        "禁止带电插拔阀岛插头，可能烧毁驱动芯片",
        "气压超过 0.8 MPa 会损伤阀膜片，必须调低",
        "槟榔粉尘易堵塞喷嘴，每月需用压缩空气反吹清理",
      ],
    }),
    related_ids_json: rel(["ss-f01", "ss-f03"]),
  },
  {
    id: "ss-f03",
    category_id: "seed-sorter",
    title: "振动给料器堵料",
    symptom:
      "槟榔原籽在振动给料盘上堆积、不前进，或单层化失败导致叠籽误判。",
    cause:
      "振动幅度过小、给料盘毛刺挂籽、槟榔籽含水率过高粘连、弹簧板断裂。",
    severity: "medium",
    frequency: 41,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "调整振动参数",
          detail:
            "进入 HMI → 给料控制，将振幅从默认 60% 上调至 70-75%，频率保持 50Hz。",
        },
        {
          order: 2,
          title: "清理给料盘",
          detail: "停机后取出堆积籽，检查盘面是否有毛刺、槟榔汁液结垢，用 800 目砂纸抛光。",
        },
        {
          order: 3,
          title: "检查原料含水率",
          detail: "用含水率仪测量槟榔原籽，应 ≤ 12%。超标需前置烘干 30 分钟。",
        },
        {
          order: 4,
          title: "检查弹簧板",
          detail: "目视检查振动器 4 组弹簧板是否有裂纹，断裂需整套更换（不可单换）。",
        },
      ],
      cautions: [
        "振幅超过 85% 会加速轴承磨损，不建议长期运行",
        "盘面禁止涂润滑油，会粘连槟榔籽",
        "含水率超标时强制烘干，否则会连带影响视觉识别",
      ],
    }),
    related_ids_json: rel(["ss-f02"]),
  },
  {
    id: "ss-f04",
    category_id: "seed-sorter",
    title: "良品率突降/误剔率升高",
    symptom: "近期良品仓的合格籽比例下降，或废品仓中混入大量饱满籽。",
    cause:
      "视觉模型漂移、光源色温变化、原料批次差异、标定数据过期。",
    severity: "high",
    frequency: 29,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "复检光源色温",
          detail: "用色温计测量光源色温，标准 5500K±200K，偏差大需更换光源。",
        },
        {
          order: 2,
          title: "采集样本复标",
          detail: "取 200 颗当前批次槟榔籽（含良/不良各半），进入视觉标定界面重新训练。",
        },
        {
          order: 3,
          title: "调整分选阈值",
          detail: "在算法参数页将'瘪籽判定阈值'从 0.65 调至 0.55-0.60，观察 10 分钟分选效果。",
        },
        {
          order: 4,
          title: "记录批次信息",
          detail: "在工单系统记录原料产地、批次、含水率，便于建立原料-参数映射库。",
        },
      ],
      cautions: [
        "重新标定必须由认证工程师操作，普通用户禁止修改模型权重",
        "阈值调整后需连续观察 30 分钟确认稳定",
        "不同产地槟榔（海南/云南/进口）参数差异大，禁止通用配置",
      ],
    }),
    related_ids_json: rel(["ss-f01"]),
  },
  {
    id: "ss-f05",
    category_id: "seed-sorter",
    title: "HMI 触摸屏无响应",
    symptom: "触摸屏点击无反应或反应延迟严重，但设备仍在运行。",
    cause:
      "触摸屏固件卡死、触摸面板受潮、静电干扰、内存溢出。",
    severity: "medium",
    frequency: 18,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "软重启 HMI",
          detail: "长按触摸屏右下角复位孔 5 秒，等待系统重启（约 90 秒）。",
        },
        {
          order: 2,
          title: "检查面板干燥",
          detail: "若环境湿度 > 85%，检查触摸屏背壳密封条，必要时加装防潮加热器。",
        },
        {
          order: 3,
          title: "静电放电",
          detail: "确认 HMI 外壳接地电阻 ≤ 4Ω，操作人员佩戴防静电手环。",
        },
        {
          order: 4,
          title: "联系工程师",
          detail: "若多次重启无效，可能为内存溢出，需工程师远程导出日志分析。",
        },
      ],
      cautions: [
        "重启 HMI 不会停机，但分选参数会回退至上次保存版本",
        "禁止用湿手或戴手套操作触摸屏",
        "频繁卡死（>3 次/周）需联系售后更换工控机内存",
      ],
    }),
    related_ids_json: rel([]),
  },
  {
    id: "ss-f06",
    category_id: "seed-sorter",
    title: "压缩空气含水量过高",
    symptom:
      "气路过滤器频繁排水，喷嘴喷出白雾，槟榔籽表面有水渍导致视觉误判。",
    cause:
      "冷干机故障、空压机后冷却器失效、气路过滤器滤芯过期。",
    severity: "medium",
    frequency: 22,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "检查冷干机",
          detail: "查看冷干机蒸发温度表，正常 2-10℃。高于 10℃ 检查制冷剂与风扇。",
        },
        {
          order: 2,
          title: "更换滤芯",
          detail: "三级过滤器滤芯更换周期 4000 小时，超标立即更换，并排水阀手动排水 3 次。",
        },
        {
          order: 3,
          title: "清理后冷却器",
          detail: "空压机后冷却器翅片若积灰，用压缩空气反向吹扫。",
        },
      ],
      cautions: [
        "含水空气会腐蚀阀岛与气缸，长期运行需加装吸干机",
        "槟榔对水敏感，含水空气会直接影响分选精度",
        "更换滤芯时必须先泄压至 0 MPa",
      ],
    }),
    related_ids_json: rel(["ss-f02"]),
  },

  // ===== 槟榔选片机故障 =====
  {
    id: "sh-f01",
    category_id: "sheet-sorter",
    title: "片厚检测精度下降",
    symptom:
      "A/B/C 三级分档混乱，厚度偏差从 ±0.1mm 降至 ±0.3mm，客户投诉分级不准。",
    cause:
      "激光厚度传感器零点漂移、传送带磨损厚度不均、传感器支架松动。",
    severity: "high",
    frequency: 33,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "执行零点校准",
          detail:
            "进入 HMI → 厚度校准 → 放入标准 0.5mm 量块 → 点击'零点校准'，等待 10 秒完成。",
        },
        {
          order: 2,
          title: "检查传送带",
          detail: "用千分表测量传送带厚度差，任意位置差值应 ≤ 0.05mm，超标更换传送带。",
        },
        {
          order: 3,
          title: "紧固传感器支架",
          detail: "检查激光传感器支架螺丝扭矩 8N·m，振动后易松动。",
        },
        {
          order: 4,
          title: "满量程校准",
          detail: "依次放入 0.5/1.0/1.5/2.0mm 量块，执行多点线性校准，R² 应 ≥ 0.999。",
        },
      ],
      cautions: [
        "校准必须在 25±2℃ 环境下进行，温度漂移会影响精度",
        "激光传感器镜头禁用有机溶剂清洁，仅用气吹",
        "槟榔片表面糖渍会污染传送带，每班次用无尘布擦拭",
      ],
    }),
    related_ids_json: rel(["sh-f02", "sh-f03"]),
  },
  {
    id: "sh-f02",
    category_id: "sheet-sorter",
    title: "视觉色差分级异常",
    symptom:
      "槟榔片颜色分级错误，深色片被分入 A 级，或浅色片被误判为瑕疵。",
    cause:
      "光源色温漂移、HALCON 算法模板过期、相机白平衡失效。",
    severity: "high",
    frequency: 27,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "重做白平衡",
          detail: "在相机镜头前放置标准白板，HMI → 视觉 → 白平衡 → 执行，10 秒完成。",
        },
        {
          order: 2,
          title: "更新颜色模板",
          detail: "取当前批次 50 片标准色样，进入 HALCON 模板管理 → 重新训练颜色模型。",
        },
        {
          order: 3,
          title: "检查光源",
          detail: "光源使用 8000 小时后色温会偏移，用色温计测量，超差需更换。",
        },
      ],
      cautions: [
        "白平衡与模板更新后必须连续观察 30 分钟",
        "槟榔烘烤程度不同颜色差异大，需按批次切换模板",
        "HALCON 算法版本升级需联系认证工程师，禁止自行降级",
      ],
    }),
    related_ids_json: rel(["sh-f01"]),
  },
  {
    id: "sh-f03",
    category_id: "sheet-sorter",
    title: "传送带跑偏",
    symptom: "传送带向一侧偏移，槟榔片堆积边缘，传感器测厚位置偏移。",
    cause:
      "张紧轮两侧不一致、托辊磨损、皮带张力不均。",
    severity: "medium",
    frequency: 24,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "停机观察跑偏方向",
          detail: "空载运行 2 分钟，标记皮带跑偏方向与位置。",
        },
        {
          order: 2,
          title: "调整张紧轮",
          detail: "跑偏侧的张紧螺栓顺时针旋转 1/4 圈，每次调整后运行 1 分钟复测。",
        },
        {
          order: 3,
          title: "检查托辊",
          detail: "用手转动各托辊，卡顿或异响需更换，托辊寿命 8000 小时。",
        },
      ],
      cautions: [
        "禁止带料调整跑偏，可能损伤皮带",
        "调整量每次不超过 1/4 圈，过度调整会反向跑偏",
        "新皮带运行 24 小时后需复紧一次",
      ],
    }),
    related_ids_json: rel([]),
  },
  {
    id: "sh-f04",
    category_id: "sheet-sorter",
    title: "分级挡板动作迟缓",
    symptom:
      "识别到目标级别后挡板翻板延迟 > 100ms，导致槟榔片落入错误分级仓。",
    cause:
      "伺服电机过载、气缸气压不足、PLC 程序扫描周期过长。",
    severity: "high",
    frequency: 19,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "测试伺服响应",
          detail: "HMI → 伺服调试 → 点动测试，响应时间应 ≤ 50ms，超标检查驱动器增益参数。",
        },
        {
          order: 2,
          title: "检查气缸气压",
          detail: "气缸型挡板工作压力 0.4-0.6 MPa，压力不足检查气源与调速阀。",
        },
        {
          order: 3,
          title: "优化 PLC 扫描周期",
          detail: "在线监控 PLC 扫描周期，应 ≤ 5ms。超标需工程师优化程序，将分级逻辑放入中断任务。",
        },
      ],
      cautions: [
        "伺服增益参数修改需认证工程师，参数错误会震荡",
        "挡板机械限位每班次检查一次，防止过冲",
        "槟榔片残留会卡住挡板，每班次清理翻板缝隙",
      ],
    }),
    related_ids_json: rel(["sh-f03"]),
  },
  {
    id: "sh-f05",
    category_id: "sheet-sorter",
    title: "HALCON 视觉算法崩溃",
    symptom:
      "HMI 报'Halcon License Expired'或'Algorithm Crash'，视觉功能完全失效。",
    cause:
      "授权文件过期、工控机系统时间错误、内存不足导致 HALCON 进程 OOM。",
    severity: "critical",
    frequency: 8,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "检查系统时间",
          detail: "授权绑定硬件时间，确认工控机时间与 NTP 服务器同步，误差 < 60 秒。",
        },
        {
          order: 2,
          title: "更新授权文件",
          detail: "联系售后获取新授权 .lic 文件，放入 C:\\Halcon\\license\\ 重启服务。",
        },
        {
          order: 3,
          title: "检查内存占用",
          detail: "任务管理器查看 HALCON 进程内存，超过 2GB 需重启工控机，并清理临时图像。",
        },
      ],
      cautions: [
        "授权文件禁止复制到其他机器，会触发硬件锁死",
        "算法崩溃期间设备会自动停机，禁止强制运行",
        "每月清理一次 C:\\Halcon\\tmp\\ 缓存图像",
      ],
    }),
    related_ids_json: rel(["sh-f02"]),
  },

  // ===== 槟榔切籽机故障 =====
  {
    id: "ct-f01",
    category_id: "seed-cutter",
    title: "切割位置偏移/对中不准",
    symptom:
      "槟榔籽切割面偏离中线，出现大小头或切到籽核，影响后续去核与片型。",
    cause:
      "伺服定位漂移、夹爪磨损、对中传感器误触发、籽型识别算法偏移。",
    severity: "high",
    frequency: 36,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "伺服回零",
          detail: "HMI → 伺服 → 回零操作，等待 X/Y/Z 三轴回零完成（约 15 秒）。",
        },
        {
          order: 2,
          title: "检查夹爪",
          detail: "目视夹爪夹持面，磨损 > 0.2mm 需更换。夹爪寿命 50 万次。",
        },
        {
          order: 3,
          title: "标定对中传感器",
          detail: "用标准槟榔模型件（直径 25mm）放入工位，触发对中传感器，调整位置至指示灯常绿。",
        },
        {
          order: 4,
          title: "重训籽型识别",
          detail: "采集 100 颗当前批次槟榔籽图像，进入算法训练界面更新籽型轮廓模型。",
        },
      ],
      cautions: [
        "伺服回零前必须确保工作区无籽料，防止撞刀",
        "夹爪更换后需重新标定零点，否则切割位置会偏",
        "海南籽与云南籽型差异大，籽型模型不可混用",
      ],
    }),
    related_ids_json: rel(["ct-f02", "ct-f03"]),
  },
  {
    id: "ct-f02",
    category_id: "seed-cutter",
    title: "刀片崩刃/切割面毛糙",
    symptom:
      "槟榔切面出现毛刺、碎屑，或刀片切削声异常，刀片检测报警。",
    cause:
      "刀片寿命到期、刀片松动、槟榔籽过硬（烘干过度）、切削速度过快。",
    severity: "high",
    frequency: 44,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "停机检查刀片",
          detail: "卸下刀片用 10 倍放大镜检查刃口，崩刃 > 0.1mm 必须更换，不可修复。",
        },
        {
          order: 2,
          title: "紧固刀轴",
          detail: "用扭矩扳手紧固刀轴螺母 12N·m，画防松标记线。",
        },
        {
          order: 3,
          title: "检测原料硬度",
          detail: "用硬度计测量槟榔籽，邵氏硬度应 65-75HA，超 80HA 需回潮处理 2 小时。",
        },
        {
          order: 4,
          title: "调整切削速度",
          detail: "HMI → 工艺参数，将主轴转速从 3000rpm 下调至 2500rpm，进给速度降 10%。",
        },
      ],
      cautions: [
        "更换刀片必须戴防割手套，刀片锋利",
        "刀片寿命到期强制更换，崩刃会连带损坏夹爪",
        "槟榔烘干过度会损伤刀片，含水率应控制在 8-12%",
      ],
    }),
    related_ids_json: rel(["ct-f01"]),
  },
  {
    id: "ct-f03",
    category_id: "seed-cutter",
    title: "去核工位失效",
    symptom: "切籽后槟榔核未剔除，混入成品片，或去核针卡死。",
    cause:
      "去核针磨损/断裂、气缸压力不足、去核位置偏移、核识别传感器失灵。",
    severity: "medium",
    frequency: 28,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "检查去核针",
          detail: "目视去核针直线度与针尖，弯曲 > 1mm 或针尖磨损需更换，针寿命 30 万次。",
        },
        {
          order: 2,
          title: "校准去核位置",
          detail: "进入调试模式，手动将去核针移动至槟榔核中心位置，保存坐标。",
        },
        {
          order: 3,
          title: "检查气缸",
          detail: "去核气缸压力 0.5-0.6 MPa，行程到位传感器是否触发。",
        },
      ],
      cautions: [
        "去核针更换后必须重新校准位置，否则会切穿槟榔片",
        "去核工位失效时设备应自动停机，禁止旁路报警运行",
        "槟榔核硬度高，去核针磨损比预期快需缩短检查周期",
      ],
    }),
    related_ids_json: rel(["ct-f01"]),
  },
  {
    id: "ct-f04",
    category_id: "seed-cutter",
    title: "伺服驱动器报警",
    symptom:
      "HMI 显示'伺服报警 E-xx'，对应轴停止运动，设备停机。",
    cause:
      "过载、过流、编码器线缆松动、驱动器参数丢失。",
    severity: "critical",
    frequency: 16,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "读取报警代码",
          detail: "HMI → 报警记录，记录 E-xx 代码。E-01 过载、E-03 过流、E-07 编码器异常。",
        },
        {
          order: 2,
          title: "对应处置",
          detail:
            "E-01：检查机械卡阻；E-03：检查电机绝缘；E-07：紧固编码器插头，测量线缆通断。",
        },
        {
          order: 3,
          title: "复位驱动器",
          detail: "断电 30 秒后重新上电，HMI → 伺服 → 报警复位。若仍报警禁止反复复位。",
        },
        {
          order: 4,
          title: "联系工程师",
          detail: "连续 3 次复位无效需工程师现场排查，可能需更换驱动器或电机。",
        },
      ],
      cautions: [
        "禁止超过 3 次强行复位，会烧毁驱动器功率模块",
        "伺服报警期间禁止手动盘车，可能损坏编码器",
        "驱动器参数丢失需工程师重新写入，普通用户禁止操作",
      ],
    }),
    related_ids_json: rel(["ct-f01"]),
  },
  {
    id: "ct-f05",
    category_id: "seed-cutter",
    title: "切籽产能下降",
    symptom:
      "每小时产量从额定 180kg 降至 120kg 以下，但设备无明显报警。",
    cause:
      "上料速度不足、夹爪动作慢、伺服加减速参数被修改、籽型识别超时。",
    severity: "low",
    frequency: 21,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "检查上料振动器",
          detail: "振动给料器振幅应在 65-75%，过低调高，过载则清理盘面积料。",
        },
        {
          order: 2,
          title: "测夹爪节拍",
          detail: "HMI → 节拍监控，单次夹持应 ≤ 0.8s，超标检查气缸调速阀。",
        },
        {
          order: 3,
          title: "恢复伺服参数",
          detail: "若加减速时间被改动，恢复出厂 50ms，禁止低于 30ms。",
        },
        {
          order: 4,
          title: "优化识别超时",
          detail: "籽型识别超时阈值默认 200ms，可在 150-300ms 调整，过低会误判。",
        },
      ],
      cautions: [
        "加减速时间过短会触发伺服过流报警",
        "夹爪节拍优化不可牺牲定位精度",
        "产能下降持续 24 小时需联系工程师远程分析日志",
      ],
    }),
    related_ids_json: rel(["ct-f02"]),
  },
  {
    id: "ct-f06",
    category_id: "seed-cutter",
    title: "安全门联锁失效",
    symptom:
      "打开安全门后设备未停机，或关门后无法启动，安全继电器指示灯异常。",
    cause:
      "安全门行程开关损坏、安全继电器触点烧蚀、接线断裂。",
    severity: "critical",
    frequency: 7,
    solution_json: sol({
      steps: [
        {
          order: 1,
          title: "立即停机",
          detail: "拍下急停按钮，断开主电源，挂'禁止合闸'警示牌。",
        },
        {
          order: 2,
          title: "检查行程开关",
          detail: "用万用表通断档测量开关动作时通断，异常更换（必须双触点冗余型）。",
        },
        {
          order: 3,
          title: "检查安全继电器",
          detail: "观察继电器指示灯，强制动作时触点不通需更换整只继电器。",
        },
        {
          order: 4,
          title: "恢复运行前测试",
          detail: "修复后必须执行 3 次开/关门测试，确认每次均能可靠停机。",
        },
      ],
      cautions: [
        "安全联锁是人身安全最后一道防线，失效时严禁运行",
        "禁止短接安全开关旁路运行",
        "安全继电器必须使用原厂型号，禁止替代品",
      ],
    }),
    related_ids_json: rel([]),
  },
];
