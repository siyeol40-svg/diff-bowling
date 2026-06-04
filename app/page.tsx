"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NyangHero from "@/components/NyangHero";
import HyperFrame from "@/components/HyperFrame";
import { getSupabase } from "@/lib/supabase";
import { freshGameState, generateRoomCode } from "@/lib/game";

export default function HomePage() {
  const router = useRouter();
  const supabase = getSupabase();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createRoom() {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      let lastErr: string | null = null;
      for (let i = 0; i < 5; i++) {
        const code = generateRoomCode();
        const { data, error } = await supabase
          .from("rooms")
          .insert({
            code,
            status: "lobby",
            game_state: freshGameState(),
          })
          .select()
          .single();
        if (!error && data) {
          try {
            const key = `diff-admin-token-${data.code}`;
            localStorage.setItem(key, data.admin_token);
          } catch {}
          router.push(`/r/${data.code}/admin`);
          return;
        }
        lastErr = error?.message ?? "알 수 없는 오류";
      }
      setError(`방 생성 실패: ${lastErr}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* 히어로 */}
        <header className="relative text-center pt-4 sm:pt-8">
          <NyangHero size={360} mood="hello" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur border-2 border-plasma-300 px-4 py-1 shadow-pop">
              <span className="inline-block w-2 h-2 rounded-full bg-nyang-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-plasma-600">
                Diff Bowling Jackpot · 2026
              </span>
            </div>
            <h1 className="mt-3 font-cute text-4xl sm:text-6xl font-black nyang-gradient-text leading-tight">
              디프냥의 볼링 잭팟
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-plasma-600 font-bold">
              🍔 배민 5만원권 <span className="text-nyang-600">8장</span> 잭팟 ·
              디프 부서 조직력 강화 🎳
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-crossing-shadow/70 font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-nyang-100 border border-nyang-300 px-2.5 py-1">
                🎯 1게임 · 1의 자리 잭팟
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-plasma-100 border border-plasma-300 px-2.5 py-1">
                🏁 2게임 · 등수 잭팟
              </span>
            </div>
          </motion.div>
        </header>

        <HyperFrame autoCycle interval={2400} />

        {/* 운영자 전용 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="wafer-card relative p-6 sm:p-7 space-y-4"
        >
          <div className="absolute top-3 right-3 text-[10px] font-extrabold tracking-widest text-plasma-600 bg-white/80 border border-plasma-200 rounded-full px-2 py-0.5">
            ADMIN ONLY
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎰</span>
              <h2 className="font-cute text-2xl sm:text-3xl font-extrabold text-plasma-700">
                운영자 시작
              </h2>
            </div>
            <p className="text-sm text-crossing-shadow mt-2">
              방을 만든 뒤, 표시되는 링크를 참가자들에게 공유하세요.
              <br />
              점수 입력 · 룰렛 진행 · 가위바위보 결정은 모두 운영자가 담당합니다.
            </p>
            <button
              onClick={createRoom}
              disabled={creating}
              className="mt-4 w-full rounded-2xl py-4 text-lg sm:text-xl font-extrabold text-white shadow-pop transition disabled:opacity-60 active:translate-y-0.5
                        bg-gradient-to-r from-nyang-500 via-orange-500 to-plasma-500
                        hover:brightness-110 hover:shadow-lg
                        border-2 border-white/30"
            >
              {creating ? "🌀 방 만드는 중..." : "🎰 새 방 만들기"}
            </button>
            <div className="mt-3 rounded-xl bg-white/70 border border-crossing-frame/30 px-3 py-2 text-xs sm:text-sm text-crossing-shadow flex items-start gap-2">
              <span className="text-base shrink-0">💡</span>
              <span>
                참가자분들은 <b>운영자가 공유한 링크</b>로만 입장할 수 있어요.
                <br />
                별도의 방 코드 입력은 필요 없습니다.
              </span>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="rounded-2xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-700 shadow-pop">
            ⚠️ {error}
          </div>
        )}

        {/* 상금 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="crossing-frame p-5 flex items-center gap-4"
        >
          <div className="text-4xl sm:text-5xl shrink-0">🎁</div>
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-plasma-600 uppercase">
              총 상금
            </div>
            <div className="font-cute text-2xl sm:text-3xl font-black nyang-gradient-text">
              배민 5만원권 × 8장
            </div>
            <div className="text-xs text-crossing-shadow mt-0.5">
              1게임 4장 · 2게임 4장
            </div>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end">
            <div className="text-[10px] font-bold tracking-wider text-crossing-shadow uppercase">
              powered by
            </div>
            <div className="font-mono font-extrabold text-plasma-600 text-sm">
              디프냥 / Supabase
            </div>
          </div>
        </motion.div>

        <footer className="text-center text-xs text-plasma-500/80 font-bold pb-4">
          ✨ made with 🧡 for the diff team ✨
        </footer>
      </div>
    </main>
  );
}
