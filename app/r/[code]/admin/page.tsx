"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRoom } from "@/lib/useRoom";
import GameStage from "@/components/GameStage";
import AdminPanel from "@/components/AdminPanel";
import DiffNyangAvatar from "@/components/DiffNyangAvatar";
import { getSupabase } from "@/lib/supabase";

function tokenKey(code: string) {
  return `diff-admin-token-${code.toUpperCase()}`;
}

export default function AdminRoomPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;
  const upperCode = code.toUpperCase();
  const router = useRouter();
  const { room, participants, loading, error } = useRoom(upperCode);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  // 토큰 자동 확인
  useEffect(() => {
    if (!room) return;
    try {
      const stored = localStorage.getItem(tokenKey(upperCode));
      if (stored && stored === room.admin_token) {
        setAuthorized(true);
      }
    } catch {}
    setTokenChecked(true);
  }, [room, upperCode]);

  // 룰렛 회전이 끝나는 시점을 운영자 화면이 책임지고 spinning 플래그를 해제.
  // (모든 클라이언트가 같은 회전 시간을 공유하므로 운영자 1명만 처리하면 동기화됨)
  useEffect(() => {
    if (!authorized || !room) return;
    const r = room.game_state.roulette;
    if (!r.spinning) return;
    const SPIN_MS = 2400 + 400; // JackpotRoulette duration + 여유
    const timer = setTimeout(async () => {
      try {
        await getSupabase()
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              roulette: { ...r, spinning: false },
            },
          })
          .eq("id", room.id);
      } catch (e) {
        console.warn("[roulette] spinning false 처리 실패", e);
      }
    }, SPIN_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, room?.id, room?.game_state.roulette.spinId, room?.game_state.roulette.spinning]);

  function submitToken() {
    if (!room) return;
    if (tokenInput.trim() === room.admin_token) {
      try {
        localStorage.setItem(tokenKey(upperCode), tokenInput.trim());
      } catch {}
      setAuthorized(true);
    } else {
      alert("운영자 토큰이 일치하지 않습니다.");
    }
  }

  if (loading || !tokenChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <DiffNyangAvatar size={96} mood="sleepy" />
          <p className="font-cute text-lg text-crossing-shadow animate-pulse">
            방 정보를 불러오는 중...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="crossing-frame p-6 max-w-md text-center space-y-3">
          <DiffNyangAvatar size={96} bounce={false} mood="confused" />
          <h2 className="font-cute text-xl font-extrabold text-red-600">
            연결 오류
          </h2>
          <p className="text-sm text-crossing-shadow whitespace-pre-wrap break-words">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="crossing-frame p-6 max-w-md text-center space-y-3">
          <DiffNyangAvatar size={96} bounce={false} mood="sulky" />
          <h2 className="font-cute text-xl font-extrabold text-crossing-ink">
            그런 방은 없어요
          </h2>
          <button
            onClick={() => router.push("/")}
            className="rounded-2xl bg-nyang-500 text-white font-bold px-4 py-2"
          >
            홈으로
          </button>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="crossing-frame p-6 max-w-md w-full space-y-4 text-center"
        >
          <DiffNyangAvatar size={96} mood="shy" />
          <div>
            <h2 className="font-cute text-xl font-extrabold text-crossing-ink">
              운영자 인증이 필요해요
            </h2>
            <p className="text-sm text-crossing-shadow mt-1">
              방을 만든 브라우저가 아닌가요?
              <br />
              운영자 토큰을 입력해 주세요.
            </p>
          </div>
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="운영자 토큰 (UUID)"
            className="w-full rounded-xl border-2 border-crossing-frame bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-nyang-400"
          />
          <div className="flex gap-2">
            <button
              onClick={submitToken}
              className="flex-1 rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-bold py-2.5"
            >
              인증
            </button>
            <button
              onClick={() => router.push(`/r/${room.code}`)}
              className="flex-1 rounded-2xl border-2 border-crossing-frame text-crossing-shadow font-bold py-2.5"
            >
              참가자 화면으로
            </button>
          </div>
          <div className="text-[11px] text-crossing-shadow/70 text-left">
            처음 방을 만든 브라우저에서는 자동으로 인증돼요. 다른 기기에서 운영해야
            한다면, 첫 화면(개발자 도구 → Console)에서 아래 명령으로 토큰을
            확인할 수 있습니다.
            <br />
            <code className="block mt-1 rounded bg-crossing-paper px-2 py-1 break-all">
              {`localStorage.getItem('${tokenKey(upperCode)}')`}
            </code>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-3 sm:p-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <GameStage room={room} participants={participants} adminMode />
        <AdminPanel room={room} participants={participants} />
      </div>
    </main>
  );
}
