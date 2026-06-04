"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/**
 * 18가지 디프냥 표정. public/nyang/<key>.png 와 매핑됩니다.
 */
export type NyangMood =
  | "thank" // 고마운 (감사)
  | "proud" // 우쭐한
  | "love" // 사랑에 빠진
  | "win" // 우승한
  | "laugh" // 웃긴
  | "eureka" // 알아낸 (!)
  | "curious" // 궁금한
  | "surprised" // 놀란
  | "shy" // 수줍은
  | "dizzy" // 어지러운
  | "confused" // 어쩔 줄 모르는
  | "flustered" // 당황한
  | "sleepy" // 졸린
  | "sad" // 슬픈
  | "sulky" // 삐진
  | "envy" // 배아픈
  | "angry"; // 화가 난

const MOOD_FILE: Record<NyangMood, string> = {
  thank: "/nyang/thank.png",
  proud: "/nyang/proud.png",
  love: "/nyang/love.png",
  win: "/nyang/win.png",
  laugh: "/nyang/laugh.png",
  eureka: "/nyang/eureka.png",
  curious: "/nyang/curious.png",
  surprised: "/nyang/surprised.png",
  shy: "/nyang/shy.png",
  dizzy: "/nyang/dizzy.png",
  confused: "/nyang/confused.png",
  flustered: "/nyang/flustered.png",
  sleepy: "/nyang/sleepy.png",
  sad: "/nyang/sad.png",
  sulky: "/nyang/sulky.png",
  envy: "/nyang/envy.png",
  angry: "/nyang/angry.png",
};

/**
 * public/nyang/<mood>.png 가 있으면 그 이미지를 보여주고,
 * 없으면 귀여운 SVG 폴백을 보여줍니다.
 *
 * halo: true 이면 첨부 일러스트와 같은 오렌지+보라 광원 후광을 깔아줍니다.
 */
export default function DiffNyangAvatar({
  size = 128,
  bounce = true,
  halo = true,
  mood = "proud",
  className = "",
}: {
  size?: number;
  bounce?: boolean;
  halo?: boolean;
  mood?: NyangMood;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = MOOD_FILE[mood] ?? MOOD_FILE.proud;

  return (
    <motion.div
      className={
        "shrink-0 relative " + (halo ? "nyang-halo " : "") + className
      }
      style={{ width: size, height: size }}
      animate={bounce ? { y: [0, -6, 0] } : undefined}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`디프냥 (${mood})`}
          width={size}
          height={size}
          onError={() => setImgFailed(true)}
          className="object-contain drop-shadow-[0_8px_14px_rgba(91,54,189,0.35)] relative z-10"
        />
      ) : (
        <FallbackNyang size={size} />
      )}
    </motion.div>
  );
}

function FallbackNyang({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.18)]"
    >
      <circle cx="60" cy="58" r="48" fill="#fff8e7" stroke="#a06a3f" strokeWidth="3" />
      <path d="M22 38 L36 18 L44 42 Z" fill="#fb923c" stroke="#a06a3f" strokeWidth="2" />
      <path d="M98 38 L84 18 L76 42 Z" fill="#fb923c" stroke="#a06a3f" strokeWidth="2" />
      <circle cx="60" cy="60" r="34" fill="#fdba74" />
      <path d="M40 56 q4 -8 12 -2" stroke="#a06a3f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M80 56 q-4 -8 -12 -2" stroke="#a06a3f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="64" r="4" fill="#3b2a20" />
      <circle cx="70" cy="64" r="4" fill="#3b2a20" />
      <circle cx="51.5" cy="62.5" r="1.4" fill="#fff" />
      <circle cx="71.5" cy="62.5" r="1.4" fill="#fff" />
      <path d="M58 73 q2 2 4 0" stroke="#a06a3f" strokeWidth="2" fill="#f97316" strokeLinejoin="round" />
      <path d="M55 78 q5 4 10 0" stroke="#a06a3f" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M14 60 q46 -28 92 0" stroke="#a06a3f" strokeWidth="2" fill="none" />
    </svg>
  );
}
