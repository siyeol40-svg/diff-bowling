import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyang: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
        },
        // 첨부 일러스트의 보라/푸른 광원 톤
        plasma: {
          50: "#F5F0FF",
          100: "#E8DCFF",
          200: "#C7B0FF",
          300: "#A185F0",
          400: "#7B5BD8",
          500: "#5B36BD",
          600: "#3F1F94",
        },
        ion: {
          400: "#60A5FA", // P (인) — 푸른 원자
          500: "#3B82F6",
          600: "#2563EB",
        },
        crossing: {
          paper: "#FFF8E7",
          ink: "#3B2A20",
          frame: "#A06A3F",
          shadow: "#7A4E2A",
          accent: "#76C7C0",
        },
      },
      fontFamily: {
        // PF Stardust 한 종으로 통일 — 모든 글자가 이 폰트로 표시됨
        sans: ["'PF Stardust'", "'Apple SD Gothic Neo'", "system-ui", "sans-serif"],
        cute: ["'PF Stardust'", "'Apple SD Gothic Neo'", "system-ui", "sans-serif"],
        body: ["'PF Stardust'", "'Apple SD Gothic Neo'", "system-ui", "sans-serif"],
        // 사용자 요청에 따라 mono 도 PF Stardust 로 통일 (tabular-nums 가 적용된 클래스에서 너비 균일화됨)
        mono: ["'PF Stardust'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        bubble: "0 8px 0 -2px rgba(160,106,63,0.35), 0 18px 30px -10px rgba(0,0,0,0.25)",
        pop: "0 6px 0 0 rgba(0,0,0,0.15)",
      },
      keyframes: {
        bounceSoft: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        spinSlot: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-1000%)" },
        },
        shine: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        ringPulse: {
          "0%": { transform: "scale(0.95)", opacity: "0.6" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0" },
          "10%": { opacity: "0.9" },
          "100%": { transform: "translateY(-160px) scale(0.7)", opacity: "0" },
        },
        auraSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        bounceSoft: "bounceSoft 1.6s ease-in-out infinite",
        wiggle: "wiggle 1.5s ease-in-out infinite",
        shine: "shine 3s linear infinite",
        confetti: "confettiFall 3s linear forwards",
        ringPulse: "ringPulse 2.4s ease-out infinite",
        floatUp: "floatUp 5s linear infinite",
        auraSpin: "auraSpin 18s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
