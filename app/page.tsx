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
  const [joinCode, setJoinCode] = useState("");

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

  function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 3) {
      setError("방 코드를 정확히 입력해 주세요.");
      return;
    }
    router.push(`/r/${code}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* 히어로 */}
        <header className="relative text-center pt-4 sm:pt-8">
          <NyangHero size={360} />

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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 운영자 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="wafer-card relative p-5 sm:p-6 space-y-3"
          >
            <div className="absolute top-3 right-3 text-[10px] font-extrabold tracking-widest text-plasma-600 bg-white/80 border border-plasma-200 rounded-full px-2 py-0.5">
              ADMIN
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎰</span>
                <h2 className="font-cute text-2xl font-extrabold text-plasma-700">
                  운영자
                </h2>
              </div>
              <p className="text-sm text-crossing-shadow mt-2">
                방을 만들고 링크를 공유해요.
                <br />
                점수 입력 · 룰렛 · 가위바위보 모두 운영자가 진행합니다.
              </p>
              <button
                onClick={createRoom}
                disabled={creating}
                className="mt-4 w-full rounded-2xl py-3.5 text-base sm:text-lg font-extrabold text-white shadow-pop transition disabled:opacity-60 active:translate-y-0.5
                          bg-gradient-to-r from-nyang-500 via-orange-500 to-plasma-500
                          hover:brightness-110 hover:shadow-lg
                          border-2 border-white/30"
              >
                {creating ? "🌀 방 만드는 중..." : "🎰 새 방 만들기"}
              </button>
              <div className="mt-2 text-[11px] text-center text-crossing-shadow/70">
                만드는 즉시 운영자 화면으로 이동해요
              </div>
            </div>
          </motion.div>

          {/* 참가자 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="wafer-card relative p-5 sm:p-6 space-y-3"
          >
            <div className="absolute top-3 right-3 text-[10px] font-extrabold tracking-widest text-nyang-600 bg-white/80 border border-nyang-300 rounded-full px-2 py-0.5">
              PARTICIPANT
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <h2 className="font-cute text-2xl font-extrabold text-nyang-700">
                  참가자
                </h2>
              </div>
              <p className="text-sm text-crossing-shadow mt-2">
                운영자가 알려준 방 코드로 입장!
                <br />
                실시간으로 룰렛/시상이 같이 흘러갑니다.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                  maxLength={6}
                  placeholder="AB3K"
                  className="flex-1 rounded-2xl border-2 border-nyang-300 bg-white px-4 py-3 font-mono text-xl tracking-widest uppercase text-center focus:outline-none focus:ring-4 focus:ring-nyang-200"
                />
                <button
                  onClick={joinRoom}
                  className="rounded-2xl bg-gradient-to-b from-nyang-400 to-nyang-600 hover:brightness-110 text-white font-extrabold px-5 shadow-pop transition border-2 border-white/30"
                >
                  입장
                </button>
              </div>
            </div>
          </motion.div>
        </section>

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
