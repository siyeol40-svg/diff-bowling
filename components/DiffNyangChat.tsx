"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DiffNyangAvatar, { type NyangMood } from "./DiffNyangAvatar";

interface ChatMessage {
  text: string;
  /** UI 가 이 메시지가 표시되는 동안 추가로 보여줄 키 (예: 위쪽 영상 frame index) */
  frame?: number;
  /** 이 메시지를 말할 때 디프냥의 표정 */
  mood?: NyangMood;
}

interface Props {
  messages: ChatMessage[];
  onFrameChange?: (frame: number | undefined) => void;
  onComplete?: () => void;
  /** 한 글자당 ms */
  speed?: number;
}

/**
 * 동물의 숲 채팅 박스 스타일.
 *  - 메시지가 한 글자씩 나타남
 *  - 박스 우하단에 깜빡이는 캐럿
 *  - 박스를 탭하면 (1) 진행 중이면 모든 글자를 한 번에 표시, (2) 다 출력됐으면 다음 메시지
 */
export default function DiffNyangChat({
  messages,
  onFrameChange,
  onComplete,
  speed = 35,
}: Props) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = messages[index];

  useEffect(() => {
    onFrameChange?.(current?.frame);
  }, [index, current?.frame, onFrameChange]);

  // 타이핑 효과
  useEffect(() => {
    if (!current) return;
    setShown("");
    setDone(false);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setShown(current.text.slice(0, i));
      if (i >= current.text.length) {
        clearInterval(timer.current!);
        setDone(true);
      }
    }, speed);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [index, current, speed]);

  const handleAdvance = () => {
    if (!done) {
      // 즉시 완료
      if (timer.current) clearInterval(timer.current);
      setShown(current.text);
      setDone(true);
      return;
    }
    if (index < messages.length - 1) {
      setIndex(index + 1);
    } else {
      onComplete?.();
    }
  };

  const progressLabel = useMemo(
    () => `${Math.min(index + 1, messages.length)} / ${messages.length}`,
    [index, messages.length],
  );

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 sm:gap-5">
        <div className="relative shrink-0">
          {/* 채팅 옆 캐릭터에 작은 회전 광원 */}
          <div
            className="absolute -inset-3 animate-auraSpin opacity-60 pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(251,146,60,0.5), rgba(192,132,252,0.4), rgba(96,165,250,0.3), rgba(251,146,60,0.5))",
              filter: "blur(18px)",
              borderRadius: "50%",
            }}
          />
          <DiffNyangAvatar size={132} mood={current?.mood ?? "laugh"} />
        </div>
        <button
          onClick={handleAdvance}
          className="crossing-frame flex-1 px-5 py-4 text-left active:scale-[0.99] transition cursor-pointer select-none"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-nyang-100 px-3 py-1 text-xs font-bold text-nyang-700">
              <span className="inline-block h-2 w-2 rounded-full bg-nyang-500" />
              디프냥
            </span>
            <span className="text-[11px] text-crossing-shadow/70 font-bold">
              {progressLabel}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-cute text-lg sm:text-xl leading-relaxed text-crossing-ink whitespace-pre-wrap break-keep min-h-[3.5rem]"
            >
              {shown}
              {done && index < messages.length - 1 && (
                <span className="ml-1 inline-block animate-bounceSoft text-nyang-500">
                  ▶
                </span>
              )}
              {!done && <span className="blink-caret" />}
            </motion.p>
          </AnimatePresence>
          <div className="mt-2 text-right text-xs text-crossing-shadow/60">
            탭하면 {done ? "다음" : "건너뛰기"}
          </div>
        </button>
      </div>
    </div>
  );
}
