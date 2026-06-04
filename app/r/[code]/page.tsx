"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRoom } from "@/lib/useRoom";
import GameStage from "@/components/GameStage";
import DiffNyangAvatar from "@/components/DiffNyangAvatar";

export default function ParticipantRoomPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;
  const router = useRouter();
  const { room, participants, loading, error } = useRoom(code.toUpperCase());

  if (loading) {
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
            앗! 연결에 문제가 있어요
          </h2>
          <p className="text-sm text-crossing-shadow whitespace-pre-wrap break-words">
            {error}
          </p>
          <button
            onClick={() => location.reload()}
            className="rounded-2xl bg-nyang-500 text-white font-bold px-4 py-2"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="crossing-frame p-6 max-w-md text-center space-y-3"
        >
          <DiffNyangAvatar size={96} bounce={false} mood="sulky" />
          <h2 className="font-cute text-xl font-extrabold text-crossing-ink">
            그런 방은 없는 것 같아요...
          </h2>
          <p className="text-sm text-crossing-shadow">
            방 코드 <span className="font-mono font-extrabold">{code}</span> 를
            다시 확인해 주세요.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-2xl bg-nyang-500 text-white font-bold px-4 py-2"
          >
            홈으로
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-3 sm:p-6">
      <div className="mx-auto w-full max-w-3xl">
        <GameStage room={room} participants={participants} />
      </div>
    </main>
  );
}
