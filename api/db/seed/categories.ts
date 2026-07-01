// 槟榔产业设备种子数据
import type { DeviceCategory } from "@shared/types";

export const categorySeed: Array<{
  id: string;
  name: string;
  icon: string;
  description: string;
}> = [
  {
    id: "seed-sorter",
    name: "槟榔智能选籽机",
    icon: "ScanLine",
    description:
      "基于机器视觉的槟榔原籽分选设备，自动剔除瘪籽、霉变籽、破损籽，保留饱满合格籽，单台产能 1.2 吨/小时。",
  },
  {
    id: "sheet-sorter",
    name: "槟榔智能选片机",
    icon: "Layers",
    description:
      "针对切制后的槟榔片进行分级分选，按厚度、瑕疵、颜色进行多级分类，输出 A/B/C 三级品，配套 HALCON 视觉算法。",
  },
  {
    id: "seed-cutter",
    name: "槟榔智能切籽机",
    icon: "Scissors",
    description:
      "精密槟榔籽对开切割设备，伺服定位精度 ±0.05mm，自动适配籽型，刀片寿命监控，配套去核工位。",
  },
];

export function toCategoryView(rows: Array<{
  id: string;
  name: string;
  icon: string;
  description: string;
  device_count: number;
  online_count: number;
}>): DeviceCategory[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    description: r.description,
    deviceCount: r.device_count,
    onlineCount: r.online_count,
  }));
}
