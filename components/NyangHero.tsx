"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/**
 * 첨부 원본 일러스트를 영웅 비주얼로 큼직하게 활용하는 컴포넌트.
 *  - public/diffnyang_hero.png 가 있으면 그걸 메인으로
 *  - 없으면 public/diffnyang.png 로 폴백
 *  - 캐릭터 주변에 동심원 후광/입자/사이드 챔버까지 같이 그림
 *
 * 부모는 width/height 를 정해주거나, default size 그대로 사용.
 */
export default function NyangHero({
  size = 320,
  withChambers = true,
  withParticles = true,
}: {
  size?: number;
  withChambers?: boolean;
  withParticles?: boolean;
}) {
  const [heroFailed, setHeroFailed] = useState(false);
  const [smallFailed, setSmallFailed] = useState(false);
  const src = !heroFailed
    ? "/diffnyang_hero.png"
    : !smallFailed
      ? "/diffnyang.png"
      : null;

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* 배경 회전 보라/오렌지 광원 */}
      <div
        className="absolute -inset-[8%] animate-auraSpin opacity-70 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(251,146,60,0.55), rgba(244,114,182,0.45), rgba(192,132,252,0.5), rgba(96,165,250,0.4), rgba(251,146,60,0.55))",
          filter: "blur(36px)",
          borderRadius: "50%",
        }}
      />
      {/* 동심원 halo */}
      <div
        className="halo-ring"
        style={{ width: "94%", height: "26%", left: "3%", bottom: "0%", opacity: 0.7 }}
      />
      <div
        className="halo-ring"
        style={{ width: "70%", height: "18%", left: "15%", bottom: "5%", opacity: 0.5 }}
      />
      <div
        className="halo-ring purple"
        style={{ width: "55%", height: "14%", left: "22.5%", bottom: "10%", opacity: 0.4 }}
      />

      {/* 사이드 메탈릭 챔버 (캐릭터 양옆에 가로지르는 튜브 느낌) */}
      {withChambers && (
        <>
          <div className="absolute" style={{ top: "38%", left: "-6%", width: "20%", height: "22%" }}>
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #e2d9f0 35%, #8d7eb3 100%)",
                  border: "2px solid rgba(91,54,189,0.35)",
                  boxShadow:
                    "inset 0 -3px 0 rgba(91,54,189,0.45), inset 0 3px 0 rgba(255,255,255,0.95), 0 10px 24px rgba(91,54,189,0.4)",
                }}
              />
              <div
                className="absolute inset-y-0 left-1/2 w-px"
                style={{ background: "rgba(91,54,189,0.25)" }}
              />
            </div>
          </div>
          <div className="absolute" style={{ top: "38%", right: "-6%", width: "20%", height: "22%" }}>
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #e2d9f0 35%, #8d7eb3 100%)",
                  border: "2px solid rgba(91,54,189,0.35)",
                  boxShadow:
                    "inset 0 -3px 0 rgba(91,54,189,0.45), inset 0 3px 0 rgba(255,255,255,0.95), 0 10px 24px rgba(91,54,189,0.4)",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* 캐릭터 본체 */}
      <motion.div
        initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.15 }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full"
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt="디프냥"
              className="w-full h-full object-contain"
              style={{
                filter:
                  "drop-shadow(0 12px 24px rgba(91,54,189,0.45)) drop-shadow(0 0 40px rgba(251,146,60,0.55))",
              }}
              onError={() => {
                if (src === "/diffnyang_hero.png") setHeroFailed(true);
                else setSmallFailed(true);
              }}
            />
          ) : (
            <FallbackBlock />
          )}
        </motion.div>
      </motion.div>

      {/* B/P 입자 */}
      {withParticles && (
        <>
          <span className="ion-particle b" style={{ left: "5%", bottom: "20%", animationDelay: "0s", animationDuration: "5.5s" }}>B</span>
          <span className="ion-particle b" style={{ left: "12%", bottom: "12%", animationDelay: "1.4s", animationDuration: "6s" }}>B</span>
          <span className="ion-particle p" style={{ left: "82%", bottom: "30%", animationDelay: "0.6s", animationDuration: "5s" }}>P</span>
          <span className="ion-particle p" style={{ left: "90%", bottom: "18%", animationDelay: "2.1s", animationDuration: "6.5s" }}>P</span>
          <span className="ion-particle b" style={{ left: "70%", bottom: "8%", animationDelay: "3.2s", animationDuration: "5.5s" }}>B</span>
          <span className="ion-particle p" style={{ left: "25%", bottom: "5%", animationDelay: "1.8s", animationDuration: "5.2s" }}>P</span>
        </>
      )}
    </div>
  );
}

function FallbackBlock() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-5xl">🐱</div>
    </div>
  );
}
