"use client";

import { useMemo } from "react";

const COLORS = ["#fb923c", "#fdba74", "#76c7c0", "#f97316", "#fde047", "#a855f7"];

/**
 * 폭죽 점들이 위에서 떨어지는 정적인 폭죽. 가벼움.
 */
export default function Confetti({ count = 60 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotate: Math.random() * 360,
        size: 6 + Math.random() * 8,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {dots.map((d) => (
        <span
          key={d.id}
          className="confetti-dot"
          style={{
            left: `${d.left}%`,
            top: "-20px",
            backgroundColor: d.color,
            animationDelay: `${d.delay}s`,
            width: d.size,
            height: d.size * 1.6,
            transform: `rotate(${d.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
