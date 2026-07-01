// 槟榔设备种子数据
export interface DeviceSeed {
  id: string;
  category_id: string;
  model: string;
  name: string;
  status: "online" | "warning" | "offline";
  specs_json: string;
  image_url: string | null;
}

const specs = (arr: Array<{ label: string; value: string }>) =>
  JSON.stringify(arr);

export const deviceSeed: DeviceSeed[] = [
  // ===== 槟榔智能选籽机 =====
  {
    id: "ss-2000",
    category_id: "seed-sorter",
    model: "BNS-XZ2000",
    name: "选籽机 BNS-XZ2000 旗舰型",
    status: "online",
    specs_json: specs([
      { label: "产能", value: "1.2 t/h" },
      { label: "视觉通道", value: "12 路" },
      { label: "剔除精度", value: "≥99.2%" },
      { label: "功率", value: "4.5 kW" },
      { label: "气压", value: "0.5-0.7 MPa" },
    ]),
    image_url: null,
  },
  {
    id: "ss-1200",
    category_id: "seed-sorter",
    model: "BNS-XZ1200",
    name: "选籽机 BNS-XZ1200 标准型",
    status: "online",
    specs_json: specs([
      { label: "产能", value: "0.8 t/h" },
      { label: "视觉通道", value: "8 路" },
      { label: "剔除精度", value: "≥98.5%" },
      { label: "功率", value: "3.2 kW" },
      { label: "气压", value: "0.5-0.7 MPa" },
    ]),
    image_url: null,
  },
  {
    id: "ss-800",
    category_id: "seed-sorter",
    model: "BNS-XZ800",
    name: "选籽机 BNS-XZ800 经济型",
    status: "warning",
    specs_json: specs([
      { label: "产能", value: "0.5 t/h" },
      { label: "视觉通道", value: "6 路" },
      { label: "剔除精度", value: "≥97%" },
      { label: "功率", value: "2.4 kW" },
      { label: "气压", value: "0.5-0.7 MPa" },
    ]),
    image_url: null,
  },
  {
    id: "ss-3000",
    category_id: "seed-sorter",
    model: "BNS-XZ3000",
    name: "选籽机 BNS-XZ3000 工业级",
    status: "offline",
    specs_json: specs([
      { label: "产能", value: "2.0 t/h" },
      { label: "视觉通道", value: "16 路" },
      { label: "剔除精度", value: "≥99.5%" },
      { label: "功率", value: "6.8 kW" },
      { label: "气压", value: "0.6-0.8 MPa" },
    ]),
    image_url: null,
  },

  // ===== 槟榔智能选片机 =====
  {
    id: "sh-500",
    category_id: "sheet-sorter",
    model: "BNS-XP500",
    name: "选片机 BNS-XP500 旗舰型",
    status: "online",
    specs_json: specs([
      { label: "产能", value: "500 kg/h" },
      { label: "分级档位", value: "A/B/C 三级" },
      { label: "片厚检测", value: "0.1 mm 精度" },
      { label: "功率", value: "3.8 kW" },
      { label: "视觉算法", value: "HALCON 22.11" },
    ]),
    image_url: null,
  },
  {
    id: "sh-300",
    category_id: "sheet-sorter",
    model: "BNS-XP300",
    name: "选片机 BNS-XP300 标准型",
    status: "online",
    specs_json: specs([
      { label: "产能", value: "300 kg/h" },
      { label: "分级档位", value: "A/B 两级" },
      { label: "片厚检测", value: "0.15 mm 精度" },
      { label: "功率", value: "2.6 kW" },
      { label: "视觉算法", value: "HALCON 22.11" },
    ]),
    image_url: null,
  },
  {
    id: "sh-200",
    category_id: "sheet-sorter",
    model: "BNS-XP200",
    name: "选片机 BNS-XP200 经济型",
    status: "warning",
    specs_json: specs([
      { label: "产能", value: "200 kg/h" },
      { label: "分级档位", value: "合格/不合格" },
      { label: "片厚检测", value: "0.2 mm 精度" },
      { label: "功率", value: "1.8 kW" },
      { label: "视觉算法", value: "HALCON 22.11" },
    ]),
    image_url: null,
  },

  // ===== 槟榔智能切籽机 =====
  {
    id: "ct-180",
    category_id: "seed-cutter",
    model: "BNS-QT180",
    name: "切籽机 BNS-QT180 旗舰型",
    status: "online",
    specs_json: specs([
      { label: "产能", value: "180 kg/h" },
      { label: "伺服定位", value: "±0.05 mm" },
      { label: "刀片寿命", value: "≥80 万次" },
      { label: "功率", value: "2.2 kW" },
      { label: "去核工位", value: "标配" },
    ]),
    image_url: null,
  },
  {
    id: "ct-120",
    category_id: "seed-cutter",
    model: "BNS-QT120",
    name: "切籽机 BNS-QT120 标准型",
    status: "online",
    specs_json: specs([
      { label: "产能", value: "120 kg/h" },
      { label: "伺服定位", value: "±0.08 mm" },
      { label: "刀片寿命", value: "≥60 万次" },
      { label: "功率", value: "1.6 kW" },
      { label: "去核工位", value: "选配" },
    ]),
    image_url: null,
  },
  {
    id: "ct-80",
    category_id: "seed-cutter",
    model: "BNS-QT80",
    name: "切籽机 BNS-QT80 经济型",
    status: "offline",
    specs_json: specs([
      { label: "产能", value: "80 kg/h" },
      { label: "伺服定位", value: "±0.1 mm" },
      { label: "刀片寿命", value: "≥40 万次" },
      { label: "功率", value: "1.2 kW" },
      { label: "去核工位", value: "无" },
    ]),
    image_url: null,
  },
];
