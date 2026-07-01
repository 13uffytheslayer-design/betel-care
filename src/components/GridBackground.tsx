// 工业网格背景 + 扫描线效果
export default function GridBackground({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 网格 */}
      <div className="absolute inset-0 bg-grid-fade bg-grid opacity-60" />

      {/* 径向辉光 */}
      {variant === "hero" && (
        <div className="absolute inset-0 bg-radial-cyan" />
      )}

      {/* 扫描线 */}
      <div className="absolute inset-x-0 top-0 h-px bg-scan-line bg-[length:200%_100%] animate-scan-move opacity-30" />

      {/* 角落装饰 */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-cyan-500/20" />
      <div className="absolute top-6 right-6 w-16 h-16 border-r border-t border-cyan-500/20" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l border-b border-cyan-500/20" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-cyan-500/20" />
    </div>
  );
}
