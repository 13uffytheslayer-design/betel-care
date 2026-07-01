// 应用入口：路由配置 + 鉴权守卫 + 滚动恢复 + 路由级懒加载
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import Home from "@/pages/Home";

// 路由级懒加载：拆分 bundle，加快首屏，避免一次性加载导致卡顿
const Devices = lazy(() => import("@/pages/Devices"));
const DeviceDetail = lazy(() => import("@/pages/DeviceDetail"));
const Chat = lazy(() => import("@/pages/Chat"));
const Knowledge = lazy(() => import("@/pages/Knowledge"));
const FaultDetail = lazy(() => import("@/pages/FaultDetail"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));

// 管理后台
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminFaults = lazy(() => import("@/pages/admin/AdminFaults"));
const AdminDevices = lazy(() => import("@/pages/admin/AdminDevices"));
const AdminFeedback = lazy(() => import("@/pages/admin/AdminFeedback"));

// 路由切换时滚动到顶部
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 路由级加载占位
function RouteFallback() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-ink-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
        </div>
        <span className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
          loading...
        </span>
      </div>
    </div>
  );
}

// 鉴权守卫：未登录跳转登录页，并在 query 中带回原目标地址
function AuthedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate to={`/login?redirect=${redirect}`} replace state={{ from: location }} />
    );
  }
  return <>{children}</>;
}

// 管理员守卫：未登录跳登录，已登录但非管理员跳首页
function AdminRoute({ children }: { children: ReactNode }) {
  const { token, user } = useAuthStore();
  const location = useLocation();
  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate to={`/login?redirect=${redirect}`} replace state={{ from: location }} />
    );
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:categoryId/:deviceId" element={<DeviceDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/knowledge/:faultId" element={<FaultDetail />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route
            path="/profile"
            element={
              <AuthedRoute>
                <Profile />
              </AuthedRoute>
            }
          />

          {/* 管理后台 */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/faults"
            element={
              <AdminRoute>
                <AdminFaults />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/devices"
            element={
              <AdminRoute>
                <AdminDevices />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <AdminRoute>
                <AdminFeedback />
              </AdminRoute>
            }
          />

          {/* 兜底：未知路径回首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
