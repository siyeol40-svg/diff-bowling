"use client";

import { useMemo } from "react";

/**
 * 첨부 일러스트의 분위기 재현:
 *  - 따뜻한 오렌지 후광 + 보라/푸른 광원이 도는 글로우
 *  - B(보라)/P(파랑) 원자 입자가 위로 떠오르는 효과
 *  - 동심원 halo 링
 *
 * absolute 로 부모 안을 채우므로, 부모는 `relative` 여야 합니다.
 */
export default function NyangAura({
  intensity = "normal",
  showParticles = true,
}: {
  intensity?: "soft" | "normal" | "bold";
  showParticles?: boolean;
}) {
  const particles = useMemo(() => {
    if (!showParticles) return [];
    const count = intensity === "bold" ? 14 : intensity === "soft" ? 6 : 10;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      kind: Math.random() > 0.5 ? "b" : "p",
      left: 5 + Math.random() * 90,
      bottom: -10 - Math.random() * 30,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      scale: 0.7 + Math.random() * 0.7,
    }));
  }, [intensity, showParticles]);

  const ringOpacity = intensity === "bold" ? 0.8 : intensity === "soft" ? 0.4 : 0.6;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 동심원 halo */}
      <div
        className="halo-ring"
        style={{
          width: "60%",
          height: "30%",
          left: "20%",
          bottom: "5%",
          opacity: ringOpacity,
          animation: "ringPulse 3s ease-out infinite",
        }}
      />
      <div
        className="halo-ring"
        style={{
          width: "80%",
          height: "20%",
          left: "10%",
          bottom: "0%",
          opacity: ringOpacity * 0.6,
          animation: "ringPulse 3s ease-out infinite 0.6s",
        }}
      />
      {/* 회전 보라/오렌지 광원 */}
      <div
        className="absolute -inset-[20%] animate-auraSpin opacity-50"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(251,146,60,0.4), rgba(192,132,252,0.3), rgba(96,165,250,0.25), rgba(251,146,60,0.4))",
          filter: "blur(40px)",
        }}
      />
      {/* B/P 원자 입자 */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`ion-particle ${p.kind}`}
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `scale(${p.scale})`,
          }}
        >
          {p.kind.toUpperCase()}
        </span>
      ))}
    </div>
  );
}
