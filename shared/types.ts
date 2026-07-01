// 前后端共享类型定义

export type DeviceCategoryId =
  | "seed-sorter"
  | "sheet-sorter"
  | "seed-cutter";

export type DeviceStatus = "online" | "warning" | "offline";

export type Severity = "low" | "medium" | "high" | "critical";

export type FeedbackType = "exception" | "suggestion";

export type FeedbackStatus = "pending" | "processing" | "resolved";

export type UserRole = "user" | "engineer" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface DeviceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  deviceCount: number;
  onlineCount: number;
}

export interface DeviceSpec {
  label: string;
  value: string;
}

export interface Device {
  id: string;
  categoryId: string;
  model: string;
  name: string;
  status: DeviceStatus;
  specs: DeviceSpec[];
  commonFaultCount: number;
  imageUrl?: string;
}

export interface DeviceDetail extends Device {
  relatedFaults: Fault[];
}

export interface SolutionStep {
  order: number;
  title: string;
  detail: string;
}

export interface FaultSolution {
  steps: SolutionStep[];
  cautions: string[];
}

export interface Fault {
  id: string;
  categoryId: string;
  title: string;
  symptom: string;
  cause: string;
  severity: Severity;
  frequency: number;
  solution: FaultSolution;
  relatedFaultIds: string[];
}

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  solutionCard?: SolutionCard;
  diagnosticOptions?: DiagnosticOption[];
  timestamp: number;
}

export interface SolutionCard {
  title: string;
  steps: string[];
  cautions: string[];
  relatedFaultId?: string;
}

export interface DiagnosticOption {
  label: string;
  value: string;
}

export interface ChatResponse {
  reply: string;
  solutionCard?: SolutionCard;
  diagnosticOptions?: DiagnosticOption[];
  needHuman?: boolean;
}

export interface Feedback {
  id: string;
  userId: number | null;
  userName?: string;
  categoryId: string;
  deviceId?: string;
  type: FeedbackType;
  title: string;
  description: string;
  problemCategory: string;
  severity: Severity;
  status: FeedbackStatus;
  reply?: string;
  images?: string[];
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  byType: { exception: number; suggestion: number };
  byCategory: { categoryId: string; name: string; count: number }[];
  byProblemCategory: { name: string; count: number }[];
  bySeverity: { severity: Severity; count: number }[];
  trend: { date: string; count: number }[];
  topKeywords: { word: string; weight: number }[];
  resolvedRate: number;
}

export interface DashboardStats {
  onlineDevices: number;
  totalDevices: number;
  monthlyResolved: number;
  avgResponseMin: number;
  knowledgeCount: number;
  feedbackCount: number;
}
