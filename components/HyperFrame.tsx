"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type FrameKey =
  | "bowling"
  | "scoreboard"
  | "input"
  | "roulette"
  | "celebrate";

interface Props {
  /** 현재 보여줄 프레임 키. 외부에서 컨트롤 가능. */
  frame?: FrameKey;
  /** 외부에서 컨트롤하지 않을 때 자동 순환 */
  autoCycle?: boolean;
  /** 자동 순환 시 한 프레임 노출 시간 (ms) */
  interval?: number;
}

const order: FrameKey[] = ["bowling", "scoreboard", "input", "roulette", "celebrate"];

const labelMap: Record<FrameKey, string> = {
  bowling: "1. 볼링 한 게임 치기",
  scoreboard: "2. 점수판 확인",
  input: "3. 점수 입력",
  roulette: "4. 잭팟 룰렛!",
  celebrate: "5. 당첨자 발표 🎉",
};

export default function HyperFrame({
  frame,
  autoCycle = true,
  interval = 2200,
}: Props) {
  const [auto, setAuto] = useState<FrameKey>("bowling");
  useEffect(() => {
    if (frame || !autoCycle) return;
    const id = setInterval(() => {
      setAuto((cur) => order[(order.indexOf(cur) + 1) % order.length]);
    }, interval);
    return () => clearInterval(id);
  }, [frame, autoCycle, interval]);

  const active = frame ?? auto;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border-4 border-crossing-frame shadow-bubble"
         style={{
           background: "linear-gradient(135deg, #fff4e0 0%, #fde4c0 40%, #f4d5ff 100%)",
         }}>
      {/* 위 라벨바 */}
      <div className="flex items-center justify-between px-4 py-2 text-white"
           style={{ background: "linear-gradient(90deg, #c2410c 0%, #7c3aed 100%)" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">하이퍼프레임</span>
          <span className="text-[11px] opacity-80">진행 흐름</span>
        </div>
        <div className="flex gap-1.5">
          {order.map((k) => (
            <span
              key={k}
              className={
                "h-2 w-2 rounded-full " +
                (k === active ? "bg-white" : "bg-white/30")
              }
            />
          ))}
        </div>
      </div>

      {/* 본문 */}
      <div className="relative h-[180px] sm:h-[220px] md:h-[260px] w-full">
        {/* 회전 오라 */}
        <div
          className="absolute -inset-[10%] animate-auraSpin opacity-30 pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(251,146,60,0.5), rgba(192,132,252,0.4), rgba(96,165,250,0.3), rgba(251,146,60,0.5))",
            filter: "blur(30px)",
          }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <FrameArt frame={active} />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/85 backdrop-blur px-3 py-1 text-xs sm:text-sm font-bold text-crossing-ink shadow">
          {labelMap[active]}
        </div>
      </div>
    </div>
  );
}

function FrameArt({ frame }: { frame: FrameKey }) {
  switch (frame) {
    case "bowling":
      return <BowlingFrame />;
    case "scoreboard":
      return <ScoreboardFrame />;
    case "input":
      return <InputFrame />;
    case "roulette":
      return <RouletteFrame />;
    case "celebrate":
      return <CelebrateFrame />;
  }
}

function BowlingFrame() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      <defs>
        <linearGradient id="lane" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
      </defs>
      {/* 레인 */}
      <polygon points="80,170 240,170 280,40 40,40" fill="url(#lane)" stroke="#A06A3F" strokeWidth="2" />
      <line x1="80" y1="170" x2="40" y2="40" stroke="#fff" strokeDasharray="6 6" />
      <line x1="240" y1="170" x2="280" y2="40" stroke="#fff" strokeDasharray="6 6" />
      {/* 핀 */}
      {[
        [160, 60],
        [148, 75],
        [172, 75],
        [136, 92],
        [160, 92],
        [184, 92],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="6" ry="9" fill="#fff" stroke="#A06A3F" strokeWidth="1.5" />
          <rect x={cx - 5} y={cy - 4} width="10" height="2" fill="#EF4444" />
        </g>
      ))}
      {/* 공 */}
      <motion.circle
        cx="160"
        cy="150"
        r="14"
        fill="#FB923C"
        stroke="#A06A3F"
        strokeWidth="2"
        initial={{ y: 0 }}
        animate={{ y: [0, -80, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="156" cy="146" r="1.6" fill="#3B2A20" />
      <circle cx="160" cy="148" r="1.6" fill="#3B2A20" />
      <circle cx="164" cy="146" r="1.6" fill="#3B2A20" />
    </svg>
  );
}

function ScoreboardFrame() {
  const rows = [
    { name: "디프냥", score: 137 },
    { name: "냥뚱이", score: 128 },
    { name: "키미", score: 94 },
    { name: "보리", score: 82 },
  ];
  return (
    <div className="px-6 sm:px-12 w-full">
      <div className="rounded-2xl bg-white/95 border-2 border-crossing-frame shadow-pop p-3 sm:p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-crossing-shadow border-b border-crossing-frame/30 pb-1.5 mb-1.5">
          <span>이름</span>
          <span>점수</span>
        </div>
        {rows.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.25 }}
            className="flex items-center justify-between py-1 text-sm sm:text-base"
          >
            <span className="font-bold text-crossing-ink">{r.name}</span>
            <span className="font-mono font-extrabold text-nyang-600">{r.score}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function InputFrame() {
  return (
    <div className="flex items-center gap-4 px-6 sm:px-10 w-full">
      <div className="flex-1 rounded-2xl bg-white/95 border-2 border-crossing-frame shadow-pop p-3 sm:p-4">
        <div className="text-xs font-bold text-crossing-shadow">디프냥의 점수</div>
        <div className="mt-1 flex items-center gap-2">
          <motion.div
            key="num"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240 }}
            className="font-mono text-4xl font-black text-nyang-600"
          >
            137
          </motion.div>
          <span className="text-xs text-crossing-shadow">점</span>
        </div>
      </div>
      <motion.div
        animate={{ rotate: [0, -10, 10, -6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-5xl"
      >
        ✏️
      </motion.div>
    </div>
  );
}

function RouletteFrame() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 jackpot-glow opacity-70" />
      {/* 동심원 halo */}
      <div className="halo-ring absolute" style={{ width: "70%", height: "26%", left: "15%", bottom: "8%", opacity: 0.7 }} />
      <div className="halo-ring absolute" style={{ width: "90%", height: "18%", left: "5%", bottom: "3%", opacity: 0.4 }} />
      <div className="relative flex gap-2">
        {["3", "5", "7"].map((d, i) => (
          <div
            key={i}
            className="relative w-14 h-20 sm:w-16 sm:h-24 overflow-hidden rounded-xl border-4 border-crossing-frame bg-white shadow-pop"
          >
            <motion.div
              animate={{ y: [0, -300] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.05,
              }}
              className="flex flex-col items-center"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
                (n, j) => (
                  <span
                    key={j}
                    className="slot-digit text-3xl sm:text-4xl text-nyang-600 h-10 flex items-center"
                  >
                    {n}
                  </span>
                ),
              )}
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/80" />
          </div>
        ))}
      </div>
      {/* B/P 입자 */}
      <span className="ion-particle b" style={{ left: "10%", bottom: "10%", animationDelay: "0s" }}>B</span>
      <span className="ion-particle p" style={{ left: "85%", bottom: "20%", animationDelay: "1.2s" }}>P</span>
      <span className="ion-particle b" style={{ left: "20%", bottom: "5%", animationDelay: "2.4s" }}>B</span>
      <span className="ion-particle p" style={{ left: "75%", bottom: "5%", animationDelay: "0.8s" }}>P</span>
      <div className="absolute -top-2 right-4 text-2xl animate-wiggle">🎰</div>
    </div>
  );
}

function CelebrateFrame() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-center"
      >
        <div className="text-5xl sm:text-6xl">🎉</div>
        <div className="mt-1 font-cute text-2xl sm:text-3xl font-extrabold text-nyang-700">
          축하드립니다!
        </div>
        <div className="text-sm text-crossing-shadow">배민 5만원권 GET</div>
      </motion.div>
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ y: -20, x: (i - 5) * 12, opacity: 0 }}
          animate={{ y: 120, opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
          className="absolute text-xl"
        >
          {["🎊", "✨", "🍔", "🥳", "🎁"][i % 5]}
        </motion.span>
      ))}
    </div>
  );
}
