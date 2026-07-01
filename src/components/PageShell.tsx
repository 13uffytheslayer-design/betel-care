// 页面级布局壳：统一容器、背景、入场动画
import { motion } from "framer-motion";
import GridBackground from "./GridBackground";
import Navbar from "./Navbar";
import MobileTabBar from "./MobileTabBar";

export default function PageShell({
  children,
  title,
  subtitle,
  showGrid = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showGrid?: boolean;
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="relative flex-1 container py-6 lg:py-8 pb-24 lg:pb-8">
        {showGrid && <GridBackground />}
        <div className="relative z-10">
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              {title && (
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-100">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1.5 text-sm text-slate-400 font-mono">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}
          {children}
        </div>
      </main>
      <footer className="hidden lg:block relative border-t border-ink-800/60 py-4">
        <div className="container flex items-center justify-between gap-2 text-xs text-slate-500 font-mono">
          <span>BETEL·CARE 槟榔设备智能售后平台 v2.4</span>
          <span>© 2026 Betel Equipment Service Platform</span>
        </div>
      </footer>
      <MobileTabBar />
    </div>
  );
}
