"use client";

import { motion } from "framer-motion";

interface Props {
  name: string;
  /** 부제 (예: "1게임 당첨" / "1등" / "보너스 라운드") */
  subtitle?: string;
  /** 표시 순서 (애니메이션 딜레이) */
  index?: number;
  /** 크게 강조 */
  big?: boolean;
}

export default function WinnerCard({ name, subtitle, index = 0, big = false }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, delay: index * 0.12 }}
      className={
        "shine-card relative rounded-2xl border-4 border-nyang-400 bg-gradient-to-b from-white to-nyang-50 shadow-pop " +
        (big ? "px-6 py-5" : "px-4 py-3")
      }
    >
      <div className="flex items-center gap-3">
        <span className={big ? "text-3xl" : "text-2xl"}>🏆</span>
        <div>
          {subtitle && (
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-nyang-600">
              {subtitle}
            </div>
          )}
          <div
            className={
              "font-cute font-extrabold text-crossing-ink " +
              (big ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl")
            }
          >
            {name}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
