/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
    },
    extend: {
      colors: {
        // 深空底色
        ink: {
          950: "#06090F",
          900: "#0A0E14",
          850: "#0E131C",
          800: "#131A26",
          750: "#1A2230",
          700: "#222C3D",
          600: "#2E3A4E",
        },
        // 电光青蓝主强调
        cyan: {
          DEFAULT: "#00D9FF",
          50: "#E6FBFF",
          100: "#B3F3FF",
          200: "#80EBFF",
          300: "#4DE3FF",
          400: "#1ADBFF",
          500: "#00D9FF",
          600: "#00A8CC",
          700: "#007A99",
          800: "#005266",
          900: "#002B33",
        },
        // 警示琥珀
        amber: {
          DEFAULT: "#FFB800",
          400: "#FFCC4D",
          500: "#FFB800",
          600: "#CC9300",
        },
        // 成功翠绿
        jade: {
          DEFAULT: "#00FF88",
          400: "#4DFFAC",
          500: "#00FF88",
          600: "#00CC6D",
        },
        // 危险赤红
        crimson: {
          DEFAULT: "#FF3D5A",
          400: "#FF7088",
          500: "#FF3D5A",
          600: "#CC3148",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Manrope"', "sans-serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 24px rgba(0, 217, 255, 0.35), 0 0 1px rgba(0, 217, 255, 0.6)",
        "glow-amber": "0 0 24px rgba(255, 184, 0, 0.35)",
        "glow-jade": "0 0 24px rgba(0, 255, 136, 0.3)",
        "inset-line": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(0,217,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.04) 1px, transparent 1px)",
        "scan-line":
          "linear-gradient(90deg, transparent, rgba(0,217,255,0.6), transparent)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scan-move": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        "blink-fast": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0.25" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scan-move": "scan-move 10s linear infinite",
        "breathe": "breathe 2.4s ease-in-out infinite",
        "blink-fast": "blink-fast 0.8s steps(1) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
