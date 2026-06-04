"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DiffNyangChat from "./DiffNyangChat";
import HyperFrame from "./HyperFrame";
import NyangHero from "./NyangHero";

type FrameKey = "bowling" | "scoreboard" | "input" | "roulette" | "celebrate";

const FRAMES: FrameKey[] = ["bowling", "scoreboard", "input", "roulette", "celebrate"];

interface Props {
  onDone?: () => void;
}

/**
 * 입장 후 처음 보여주는 룰 설명. 디프냥이 동물의 숲 채팅으로 알려주고,
 * 위 하이퍼프레임이 자동으로 같이 움직입니다.
 */
export default function RulesIntro({ onDone }: Props) {
  const [frameIdx, setFrameIdx] = useState<number | undefined>(0);
  const [heroVisible, setHeroVisible] = useState(true);

  const messages = [
    { text: "안녕! 나는 디프냥이야 🐾\n오늘 같이 볼링 미니게임 할 거야!", frame: 0, mood: "laugh" as const },
    { text: "총 상금은 배민 5만원권 8장! 두 게임 동안 4장씩 풀려.", frame: 4, mood: "love" as const },
    { text: "먼저 각자 볼링 한 게임씩 치고 와줘. 점수는 잘 기억해 두기!", frame: 0, mood: "eureka" as const },
    { text: "운영자가 우리 점수를 모아서 점수판에 정리해 줄 거야.", frame: 1, mood: "curious" as const },
    { text: "그다음 운영자 화면에서 점수가 입력되면, 너희 화면에도 자동으로 보여!", frame: 2, mood: "envy" as const },
    { text: "[1게임] 잭팟 룰렛이 0부터 9까지 돌아가고…\n내 점수의 1의 자리 숫자랑 같으면 당첨! 🎯", frame: 3, mood: "surprised" as const },
    { text: "당첨자가 4명 이하면 일단 시상하고 한 번 더 돌려.\n4명을 넘기면 가위바위보로 뽑아!", frame: 4, mood: "angry" as const },
    { text: "[2게임] 모두 다시 한 게임 치고 점수 입력!\n이번엔 등수가 먼저 공개돼.", frame: 1, mood: "proud" as const },
    { text: "그리고 룰렛이 1등부터 N등 사이에서 돌아가.\n뽑힌 등수가 너면 당첨!", frame: 3, mood: "dizzy" as const },
    { text: "동점자가 있으면 가위바위보로 결정해.\n이렇게 4명 뽑힐 때까지 진행하면 끝!", frame: 4, mood: "confused" as const },
    { text: "준비됐어? 곧 운영자가 게임을 시작할 거야.\n위 화면을 잘 지켜봐 줘~ 🧡", frame: 4, mood: "shy" as const },
  ];

  return (
    <div className="space-y-4">
      {/* 첫 인사 단계에서는 큰 히어로 일러스트를 풀로 보여줌 */}
      <AnimatePresence>
        {heroVisible && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, height: 0 }}
            transition={{ duration: 0.4 }}
            className="wafer-card relative p-4 sm:p-6 overflow-visible"
          >
            <div className="absolute top-3 right-4 text-[10px] font-extrabold tracking-widest text-plasma-600 bg-white/80 border border-plasma-200 rounded-full px-2 py-0.5 z-20">
              INTRO
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <NyangHero size={260} mood="proud" />
              <div className="text-center sm:text-left flex-1">
                <div className="text-[11px] font-extrabold tracking-widest text-plasma-600 uppercase">
                  Welcome
                </div>
                <h2 className="font-cute text-3xl sm:text-4xl font-black nyang-gradient-text leading-tight">
                  디프냥의 볼링 잭팟
                </h2>
                <p className="text-sm text-crossing-shadow mt-1">
                  배민 5만원권 8장이 달린 두 판의 잭팟!
                  <br />
                  운영자 진행에 맞춰 화면이 자동으로 흘러가요.
                </p>
                <button
                  onClick={() => setHeroVisible(false)}
                  className="mt-3 rounded-2xl bg-gradient-to-r from-nyang-500 to-plasma-500 hover:brightness-110 text-white font-extrabold px-5 py-2 shadow-pop text-sm"
                >
                  ▶ 디프냥의 룰 설명 듣기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!heroVisible && (
        <>
          <HyperFrame
            frame={frameIdx != null ? FRAMES[Math.min(frameIdx, FRAMES.length - 1)] : undefined}
            autoCycle={false}
          />
          <DiffNyangChat
            messages={messages}
            onFrameChange={(f) => setFrameIdx(f)}
            onComplete={onDone}
          />
        </>
      )}
    </div>
  );
}
