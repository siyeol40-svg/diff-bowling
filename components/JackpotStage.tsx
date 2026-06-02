"use client";

import { ReactNode } from "react";

/**
 * 룰렛/잭팟 화면 전용 무대.
 *  - 첨부 일러스트의 캐릭터 발 밑 톤(오렌지 동심원 + 보라 입자)
 *  - 좌우 메탈릭 챔버 디테일
 *  - 가운데 자식으로 룰렛이 들어옴
 */
export default function JackpotStage({
  children,
  intensity = "normal",
}: {
  children: ReactNode;
  intensity?: "soft" | "normal" | "bold";
}) {
  const ringOpacity = intensity === "bold" ? 0.85 : intensity === "soft" ? 0.45 : 0.65;
  const blurStrength = intensity === "bold" ? 50 : intensity === "soft" ? 30 : 40;

  return (
    <div className="relative w-full halo-floor py-8">
      {/* 회전 광원 */}
      <div
        className="absolute inset-0 animate-auraSpin pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(251,146,60,0.45), rgba(244,114,182,0.35), rgba(192,132,252,0.45), rgba(96,165,250,0.35), rgba(251,146,60,0.45))",
          filter: `blur(${blurStrength}px)`,
          opacity: ringOpacity,
          borderRadius: "40%",
        }}
      />
      {/* 동심원 halo */}
      <div className="halo-ring" style={{ width: "85%", height: "26%", left: "7.5%", bottom: "8%", opacity: ringOpacity }} />
      <div className="halo-ring" style={{ width: "65%", height: "18%", left: "17.5%", bottom: "14%", opacity: ringOpacity * 0.7 }} />
      <div className="halo-ring purple" style={{ width: "50%", height: "12%", left: "25%", bottom: "20%", opacity: ringOpacity * 0.6 }} />

      {/* 좌우 메탈릭 챔버 */}
      <div
        className="absolute"
        style={{ top: "30%", left: "-10px", width: "70px", height: "26px" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #e2d9f0 35%, #8d7eb3 100%)",
            border: "2px solid rgba(91,54,189,0.35)",
            boxShadow:
              "inset 0 -2px 0 rgba(91,54,189,0.45), inset 0 2px 0 rgba(255,255,255,0.95), 0 6px 16px rgba(91,54,189,0.35)",
          }}
        />
      </div>
      <div
        className="absolute"
        style={{ top: "30%", right: "-10px", width: "70px", height: "26px" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #e2d9f0 35%, #8d7eb3 100%)",
            border: "2px solid rgba(91,54,189,0.35)",
            boxShadow:
              "inset 0 -2px 0 rgba(91,54,189,0.45), inset 0 2px 0 rgba(255,255,255,0.95), 0 6px 16px rgba(91,54,189,0.35)",
          }}
        />
      </div>

      {/* 화염 꼬리 (좌측) */}
      <div className="flame-tail" style={{ left: "8%", top: "30%" }} />

      {/* 본체 */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>

      {/* B/P 입자 */}
      <span className="ion-particle b" style={{ left: "12%", bottom: "5%", animationDelay: "0s" }}>B</span>
      <span className="ion-particle b" style={{ left: "18%", bottom: "15%", animationDelay: "1.4s" }}>B</span>
      <span className="ion-particle p" style={{ left: "78%", bottom: "8%", animationDelay: "0.6s" }}>P</span>
      <span className="ion-particle p" style={{ left: "88%", bottom: "18%", animationDelay: "2.1s" }}>P</span>
      <span className="ion-particle b" style={{ left: "65%", bottom: "3%", animationDelay: "3.2s" }}>B</span>
      <span className="ion-particle p" style={{ left: "30%", bottom: "10%", animationDelay: "1.8s" }}>P</span>
    </div>
  );
}
