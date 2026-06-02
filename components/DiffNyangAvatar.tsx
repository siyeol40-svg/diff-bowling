"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/**
 * public/diffnyang.png 가 있으면 그 이미지를 보여주고,
 * 없으면 귀여운 SVG 폴백을 보여줍니다.
 *
 * 사용자가 첨부한 디프냥 캐릭터 PNG 를 public/diffnyang.png 로 저장하면
 * 자동으로 그 그림이 사용됩니다.
 *
 * halo: true 이면 첨부 일러스트와 같은 오렌지+보라 광원 후광을 깔아줍니다.
 */
export default function DiffNyangAvatar({
  size = 128,
  bounce = true,
  halo = true,
  className = "",
}: {
  size?: number;
  bounce?: boolean;
  halo?: boolean;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.div
      className={
        "shrink-0 relative " + (halo ? "nyang-halo " : "") + className
      }
      style={{ width: size, height: size }}
      animate={
        bounce
          ? { y: [0, -6, 0] }
          : undefined
      }
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/diffnyang.png"
          alt="디프냥"
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
      {/* 헬멧 */}
      <circle cx="60" cy="58" r="48" fill="#fff8e7" stroke="#a06a3f" strokeWidth="3" />
      {/* 귀 */}
      <path d="M22 38 L36 18 L44 42 Z" fill="#fb923c" stroke="#a06a3f" strokeWidth="2" />
      <path d="M98 38 L84 18 L76 42 Z" fill="#fb923c" stroke="#a06a3f" strokeWidth="2" />
      {/* 얼굴 */}
      <circle cx="60" cy="60" r="34" fill="#fdba74" />
      <path d="M40 56 q4 -8 12 -2" stroke="#a06a3f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M80 56 q-4 -8 -12 -2" stroke="#a06a3f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 눈 */}
      <circle cx="50" cy="64" r="4" fill="#3b2a20" />
      <circle cx="70" cy="64" r="4" fill="#3b2a20" />
      <circle cx="51.5" cy="62.5" r="1.4" fill="#fff" />
      <circle cx="71.5" cy="62.5" r="1.4" fill="#fff" />
      {/* 코 */}
      <path d="M58 73 q2 2 4 0" stroke="#a06a3f" strokeWidth="2" fill="#f97316" strokeLinejoin="round" />
      {/* 입 */}
      <path d="M55 78 q5 4 10 0" stroke="#a06a3f" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 헬멧 라인 */}
      <path d="M14 60 q46 -28 92 0" stroke="#a06a3f" strokeWidth="2" fill="none" />
    </svg>
  );
}
