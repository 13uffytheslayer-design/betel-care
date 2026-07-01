// 前端 API 客户端：统一封装请求与错误处理
import type {
  AuthResult,
  ChatResponse,
  DashboardStats,
  Device,
  DeviceCategory,
  DeviceDetail,
  Fault,
  Feedback,
  FeedbackStats,
} from "@shared/types";

const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("betel_token");
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = false } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: { success: boolean; data?: T; error?: string };
  try {
    json = await res.json();
  } catch {
    throw new ApiError("服务器响应解析失败", res.status);
  }
  if (!json.success) {
    throw new ApiError(json.error || "请求失败", res.status);
  }
  return json.data as T;
}

// ===== 鉴权 =====
export const authApi = {
  register: (input: {
    email: string;
    password: string;
    name: string;
    company?: string;
    role?: "user" | "engineer";
  }) => request<AuthResult>("/auth/register", { method: "POST", body: input }),
  login: (email: string, password: string) =>
    request<AuthResult>("/auth/login", { method: "POST", body: { email, password } }),
  demo: () => request<AuthResult>("/auth/demo", { method: "POST" }),
  me: () => request<AuthResult["user"]>("/auth/me", { auth: true }),
};

// ===== 设备 =====
export const deviceApi = {
  categories: () => request<DeviceCategory[]>("/devices/categories"),
  list: (categoryId?: string) =>
    request<Device[]>(
      "/devices" + (categoryId ? `?categoryId=${categoryId}` : ""),
    ),
  detail: (id: string) => request<DeviceDetail>(`/devices/${id}`),
  dashboard: () => request<DashboardStats>("/devices/stats/dashboard"),
};

// ===== 故障知识库 =====
export const faultApi = {
  list: (params: {
    categoryId?: string;
    severity?: string;
    keyword?: string;
    sort?: "frequency" | "severity";
  }) => {
    const q = new URLSearchParams();
    if (params.categoryId) q.set("categoryId", params.categoryId);
    if (params.severity) q.set("severity", params.severity);
    if (params.keyword) q.set("keyword", params.keyword);
    if (params.sort) q.set("sort", params.sort);
    const qs = q.toString();
    return request<Fault[]>(`/faults${qs ? "?" + qs : ""}`);
  },
  detail: (id: string) => request<Fault>(`/faults/${id}`),
};

// ===== 智能客服 =====
export const chatApi = {
  send: (input: {
    message: string;
    categoryId?: string;
    deviceId?: string;
  }) => request<ChatResponse>("/chat/message", { method: "POST", body: input }),
};

// ===== 反馈 =====
export const feedbackApi = {
  create: (input: {
    categoryId: string;
    deviceId?: string;
    type: "exception" | "suggestion";
    title: string;
    description: string;
    images?: string[];
  }) => request<Feedback>("/feedback", { method: "POST", body: input, auth: true }),
  mine: () => request<Feedback[]>("/feedback/mine", { auth: true }),
  previewClassify: (text: string, categoryId: string) =>
    request<{ problemCategory: string; severity: string }>("/feedback/preview-classify", {
      method: "POST",
      body: { text, categoryId },
    }),
};

// ===== 管理员 =====
export const adminApi = {
  // 故障知识库
  listFaults: () => request<Fault[]>("/faults/all"),
  createFault: (input: {
    categoryId: string;
    title: string;
    symptom: string;
    cause: string;
    severity: "low" | "medium" | "high" | "critical";
    frequency?: number;
    solution: { steps: { order: number; title: string; detail: string }[]; cautions: string[] };
    relatedFaultIds?: string[];
  }) => request<Fault>("/faults", { method: "POST", body: input, auth: true }),
  updateFault: (
    id: string,
    input: Partial<{
      categoryId: string;
      title: string;
      symptom: string;
      cause: string;
      severity: "low" | "medium" | "high" | "critical";
      frequency: number;
      solution: { steps: { order: number; title: string; detail: string }[]; cautions: string[] };
      relatedFaultIds: string[];
    }>,
  ) => request<Fault>(`/faults/${id}`, { method: "PUT", body: input, auth: true }),
  deleteFault: (id: string) =>
    request<{ id: string }>(`/faults/${id}`, { method: "DELETE", auth: true }),

  // 设备
  listAllDevices: () => request<Device[]>("/devices/admin/all", { auth: true }),
  createDevice: (input: {
    categoryId: string;
    model: string;
    name: string;
    status?: "online" | "warning" | "offline";
    specs?: { label: string; value: string }[];
    imageUrl?: string;
  }) => request<Device>("/devices", { method: "POST", body: input, auth: true }),
  updateDevice: (
    id: string,
    input: Partial<{
      categoryId: string;
      model: string;
      name: string;
      status: "online" | "warning" | "offline";
      specs: { label: string; value: string }[];
      imageUrl: string;
    }>,
  ) => request<Device>(`/devices/${id}`, { method: "PUT", body: input, auth: true }),
  deleteDevice: (id: string) =>
    request<{ id: string }>(`/devices/${id}`, { method: "DELETE", auth: true }),

  // 设备板块
  createCategory: (input: {
    id: string;
    name: string;
    icon?: string;
    description?: string;
  }) =>
    request<DeviceCategory>("/devices/categories", {
      method: "POST",
      body: input,
      auth: true,
    }),
  updateCategory: (
    id: string,
    input: Partial<{ name: string; icon: string; description: string }>,
  ) =>
    request<DeviceCategory>(`/devices/categories/${id}`, {
      method: "PUT",
      body: input,
      auth: true,
    }),
  deleteCategory: (id: string) =>
    request<{ id: string }>(`/devices/categories/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  // 反馈管理（管理员视角）
  listFeedbacks: () => request<Feedback[]>("/feedback", { auth: true }),
  feedbackStats: () => request<FeedbackStats>("/feedback/stats", { auth: true }),
  replyFeedback: (id: string, reply: string) =>
    request<{ id: string; status: string }>(`/feedback/${id}/reply`, {
      method: "POST",
      body: { reply },
      auth: true,
    }),
  updateFeedbackStatus: (id: string, status: "pending" | "processing" | "resolved") =>
    request<{ id: string; status: string }>(`/feedback/${id}/status`, {
      method: "PUT",
      body: { status },
      auth: true,
    }),
};

export { ApiError };
