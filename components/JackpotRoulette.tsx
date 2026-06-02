"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  /** 룰렛 종류. ones = 0~9, rank = 1~max */
  kind: "ones" | "rank";
  /** rank 용 최댓값 */
  max?: number;
  /** 외부에서 트리거할 spin id. 바뀌면 새 회전을 시작 */
  spinId: number;
  /** 정지했을 때의 최종 값. spinId 가 바뀐 후 부모가 결과를 결정해서 내려보냄. */
  result: number | null;
  /** 회전 길이 (ms) */
  duration?: number;
  /** 정지했을 때 호출됨 */
  onStop?: (value: number) => void;
  /** 점수의 1의 자리 라벨? (게임2 라면 "등") */
  unitLabel?: string;
}

const ITEM_HEIGHT = 96; // tailwind h-24 와 맞춤

/**
 * 슬롯머신처럼 숫자가 위로 흐르다가 천천히 멈추는 룰렛.
 *  - kind === "ones": 0~9
 *  - kind === "rank": 1~max (참가자 수)
 *
 * spinId 가 바뀌면 자동으로 회전을 시작합니다.
 * 회전이 시작될 때 부모에게서 result 가 동시에 내려오면 그 값에 정확히 정지합니다.
 * (운영자가 클릭 → 부모가 결과를 정한 뒤 DB 반영 → 모든 화면에서 spinId/result 가 같이 갱신)
 */
export default function JackpotRoulette({
  kind,
  max = 10,
  spinId,
  result,
  duration = 2400,
  onStop,
  unitLabel,
}: Props) {
  const controls = useAnimationControls();
  const [phase, setPhase] = useState<"idle" | "spinning" | "stopped">("idle");
  const lastSpinIdRef = useRef<number>(-1);

  // 숫자 후보 배열
  const numbers =
    kind === "ones"
      ? Array.from({ length: 10 }, (_, i) => i)
      : Array.from({ length: Math.max(1, max) }, (_, i) => i + 1);

  // 슬롯에 그릴 긴 시퀀스 (반복)
  const REPEATS = 24;
  const reel = Array.from({ length: REPEATS }, () => numbers).flat();

  useEffect(() => {
    if (spinId === 0) return;
    if (lastSpinIdRef.current === spinId) return;
    lastSpinIdRef.current = spinId;

    let canceled = false;

    async function run() {
      setPhase("spinning");
      // 일단 처음 위치로 즉시 점프
      await controls.start({ y: 0, transition: { duration: 0 } });
      // 결과를 모를 때를 대비해 길게 한 바퀴 돌리는데, 부모가 줄 result 를 잠시 기다림.
      // 여기서는 부모가 result 를 spinId 와 같은 타이밍에 내려보낸다고 가정.
      const target = result;
      if (target == null) {
        // 결과가 없으면 무한 회전 시뮬레이션 → 일정 시간 후 멈춤
        await controls.start({
          y: -ITEM_HEIGHT * numbers.length * 5,
          transition: { duration: duration / 1000, ease: [0.05, 0.6, 0.2, 1] },
        });
        if (canceled) return;
        setPhase("stopped");
        return;
      }
      // target 의 reel 인덱스를 계산. 끝쪽 한 바퀴 안에 위치하도록.
      const lastFullPass = (REPEATS - 2) * numbers.length;
      const targetIndex =
        lastFullPass +
        (kind === "ones" ? target : target - 1);
      const finalY = -ITEM_HEIGHT * targetIndex;
      await controls.start({
        y: finalY,
        transition: { duration: duration / 1000, ease: [0.05, 0.6, 0.2, 1] },
      });
      if (canceled) return;
      setPhase("stopped");
      onStop?.(target);
    }
    run();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId]);

  return (
    <div className="relative inline-flex flex-col items-center px-8 py-6">
      {/* 회전 보라/오렌지 광원 */}
      <div
        className="absolute inset-0 animate-auraSpin opacity-50 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(251,146,60,0.45), rgba(192,132,252,0.35), rgba(96,165,250,0.3), rgba(251,146,60,0.45))",
          filter: "blur(28px)",
          borderRadius: "50%",
        }}
      />
      {/* 동심원 halo */}
      <div className="halo-ring" style={{ width: "70%", height: "30%", left: "15%", bottom: "8%", opacity: 0.6 }} />
      <div className="halo-ring" style={{ width: "92%", height: "20%", left: "4%", bottom: "0%", opacity: 0.35 }} />

      <div className="relative flex items-end gap-2 sm:gap-3">
        <span className="text-3xl sm:text-4xl animate-wiggle">🎰</span>
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl border-[6px] border-crossing-frame bg-white shadow-pop"
             style={{
               boxShadow:
                 "0 0 0 2px rgba(255,255,255,0.6) inset, 0 8px 0 -2px #7a4e2a, 0 0 40px rgba(251,146,60,0.6), 0 0 60px rgba(192,132,252,0.4)",
             }}>
          {/* 회전 휠 */}
          <motion.div animate={controls} className="will-change-transform">
            {reel.map((n, i) => (
              <div
                key={i}
                className="h-24 sm:h-28 flex items-center justify-center"
              >
                <span className="slot-digit text-5xl sm:text-6xl text-nyang-700">
                  {n}
                </span>
              </div>
            ))}
          </motion.div>
          {/* 위/아래 그라데이션 마스크 */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
          {/* 중앙 강조선 */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-nyang-500 via-plasma-400 to-ion-500" />
          <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-nyang-300/60 rounded-2xl" />
        </div>
        <span className="text-3xl sm:text-4xl animate-wiggle">🎰</span>
      </div>

      {/* B/P 떠다니는 입자 */}
      <span className="ion-particle b" style={{ left: "5%", bottom: "5%", animationDelay: "0s" }}>B</span>
      <span className="ion-particle p" style={{ left: "92%", bottom: "12%", animationDelay: "1.5s" }}>P</span>
      <span className="ion-particle p" style={{ left: "10%", bottom: "25%", animationDelay: "2.8s" }}>P</span>
      <span className="ion-particle b" style={{ left: "88%", bottom: "30%", animationDelay: "0.9s" }}>B</span>
      {unitLabel && (
        <div className="mt-3 text-sm sm:text-base font-bold text-crossing-shadow">
          {unitLabel}
        </div>
      )}
      {phase === "spinning" && (
        <div className="mt-1 text-xs sm:text-sm text-nyang-600 font-bold animate-pulse">
          🌀 잭팟 돌리는 중...
        </div>
      )}
    </div>
  );
}
