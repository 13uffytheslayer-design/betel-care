// 全局状态：用户鉴权 + 客服会话上下文
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@shared/types";
import { authApi } from "./api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    company?: string;
    role?: "user" | "engineer";
  }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      login: async (email, password) => {
        const { token, user } = await authApi.login(email, password);
        localStorage.setItem("betel_token", token);
        set({ token, user });
      },
      register: async (input) => {
        const { token, user } = await authApi.register(input);
        localStorage.setItem("betel_token", token);
        set({ token, user });
      },
      demoLogin: async () => {
        const { token, user } = await authApi.demo();
        localStorage.setItem("betel_token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("betel_token");
        set({ user: null, token: null });
      },
      refreshUser: async () => {
        const user = await authApi.me();
        set({ user });
      },
    }),
    {
      name: "betel-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);

// 客服会话上下文：当前选中的设备板块/设备
interface ChatContextState {
  categoryId: string | null;
  deviceId: string | null;
  setCategory: (id: string | null) => void;
  setDevice: (id: string | null) => void;
}

export const useChatContext = create<ChatContextState>((set) => ({
  categoryId: null,
  deviceId: null,
  setCategory: (id) => set({ categoryId: id, deviceId: null }),
  setDevice: (id) => set({ deviceId: id }),
}));
