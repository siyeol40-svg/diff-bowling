"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import type { Participant, Room } from "@/lib/types";
import { PRIZE_PER_GAME } from "@/lib/types";
import { groupByRank, onesDigit, statusLabel } from "@/lib/game";
import JackpotRoulette from "./JackpotRoulette";
import WinnerCard from "./WinnerCard";
import HyperFrame from "./HyperFrame";
import Confetti from "./Confetti";
import RulesIntro from "./RulesIntro";
import JackpotStage from "./JackpotStage";
import DiffNyangAvatar from "./DiffNyangAvatar";
import NyangHero from "./NyangHero";

interface Props {
  room: Room;
  participants: Participant[];
  /** 운영자 패널이 아래에 붙는지 여부 (UI 톤만 살짝 다르게) */
  adminMode?: boolean;
}

const FRAME_BY_STATUS: Record<string, "bowling" | "scoreboard" | "input" | "roulette" | "celebrate" | undefined> = {
  lobby: undefined, // RulesIntro 자체에서 처리
  game1_input: "input",
  game1_roulette: "roulette",
  game1_rps: "roulette",
  game1_done: "celebrate",
  game2_input: "input",
  game2_ranking: "scoreboard",
  game2_roulette: "roulette",
  game2_rps: "roulette",
  finished: "celebrate",
};

export default function GameStage({ room, participants, adminMode = false }: Props) {
  const status = room.status;
  const nameOf = useMemo(() => {
    const map = new Map(participants.map((p) => [p.id, p.name] as const));
    return (id: string) => map.get(id) ?? "(?)";
  }, [participants]);

  return (
    <div className="space-y-4">
      {/* 상태 헤더 */}
      <div className="relative flex items-center justify-between rounded-2xl border-2 border-crossing-frame px-4 py-2 shadow-pop overflow-hidden"
           style={{
             background:
               "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,236,210,0.9) 50%, rgba(244,213,255,0.85) 100%)",
           }}>
        <div className="relative z-10">
          <div className="text-[11px] uppercase tracking-wider text-plasma-500 font-bold">
            현재 단계
          </div>
          <div className="font-cute text-lg sm:text-xl font-extrabold nyang-gradient-text">
            {statusLabel(status)}
          </div>
        </div>
        <div className="relative z-10 text-right">
          <div className="text-[11px] uppercase tracking-wider text-plasma-500 font-bold">
            방 코드
          </div>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-crossing-ink tracking-widest">
            {room.code}
          </div>
        </div>
      </div>

      {/* lobby 는 룰 설명 화면을 통째로 보여줌 */}
      {status === "lobby" && <RulesIntro />}

      {/* 그 외엔 상단 하이퍼프레임 */}
      {status !== "lobby" && (
        <HyperFrame frame={FRAME_BY_STATUS[status]} autoCycle={false} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {status === "game1_input" && (
            <ScoreInputBoard
              room={room}
              participants={participants}
              game={1}
            />
          )}
          {status === "game1_roulette" && (
            <Game1RouletteBoard
              room={room}
              participants={participants}
              nameOf={nameOf}
            />
          )}
          {status === "game1_rps" && (
            <RpsBoard room={room} game={1} nameOf={nameOf} />
          )}
          {status === "game1_done" && (
            <WinnersBoard
              title="🏆 1게임 당첨자"
              subtitle="배민 5만원권 4장!"
              winnerIds={room.game_state.game1.winners}
              nameOf={nameOf}
              showConfetti
            />
          )}
          {status === "game2_input" && (
            <ScoreInputBoard
              room={room}
              participants={participants}
              game={2}
            />
          )}
          {status === "game2_ranking" && (
            <RankingBoard participants={participants} />
          )}
          {status === "game2_roulette" && (
            <Game2RouletteBoard
              room={room}
              participants={participants}
              nameOf={nameOf}
            />
          )}
          {status === "game2_rps" && (
            <RpsBoard room={room} game={2} nameOf={nameOf} />
          )}
          {status === "finished" && (
            <FinishedBoard
              room={room}
              participants={participants}
              nameOf={nameOf}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 점수 입력 진행 보드                                                 */
/* ------------------------------------------------------------------ */

function ScoreInputBoard({
  participants,
  game,
}: {
  room: Room;
  participants: Participant[];
  game: 1 | 2;
}) {
  const scoreOf = (p: Participant) =>
    game === 1 ? p.game1_score : p.game2_score;
  const filled = participants.filter((p) => scoreOf(p) != null).length;
  const total = participants.length || 1;
  return (
    <div className="crossing-frame p-5 space-y-3">
      <div>
        <h3 className="font-cute text-xl font-extrabold text-crossing-ink">
          🎳 {game}게임 · 점수 입력 중
        </h3>
        <p className="text-sm text-crossing-shadow">
          운영자가 모두의 점수를 입력하면 자동으로 다음 단계로 넘어가요.
        </p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-nyang-100">
        <div
          className="h-full rounded-full bg-nyang-500 transition-all"
          style={{ width: `${(filled / total) * 100}%` }}
        />
      </div>
      <div className="text-xs text-crossing-shadow text-right">
        {filled} / {participants.length} 명 입력 완료
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {participants.length === 0 && (
          <li className="text-sm text-crossing-shadow/70 italic">
            아직 등록된 참가자가 없어요. 운영자에게 알려주세요.
          </li>
        )}
        {participants.map((p) => {
          const s = scoreOf(p);
          return (
            <li
              key={p.id}
              className={
                "flex items-center justify-between rounded-xl border-2 px-3 py-2 text-sm " +
                (s != null
                  ? "border-nyang-300 bg-nyang-50"
                  : "border-crossing-frame/30 bg-white/70")
              }
            >
              <span className="font-bold text-crossing-ink truncate">
                {p.name}
              </span>
              {s != null ? (
                <span className="font-mono font-extrabold text-nyang-600">
                  {s}
                </span>
              ) : (
                <span className="text-xs text-crossing-shadow/60">대기 중...</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1게임 룰렛 보드                                                     */
/* ------------------------------------------------------------------ */

function Game1RouletteBoard({
  room,
  participants,
  nameOf,
}: {
  room: Room;
  participants: Participant[];
  nameOf: (id: string) => string;
}) {
  const { game1, roulette } = room.game_state;
  const candidatesNames = game1.candidates.map(nameOf);

  // 후보가 결정되어 화면에 표시되어 있는 상태
  const showCandidates = !roulette.spinning && roulette.result != null && game1.candidates.length > 0;
  const noMatch = !roulette.spinning && roulette.result != null && game1.candidates.length === 0;

  return (
    <div className="space-y-4">
      <div className="wafer-card relative p-5 sm:p-6 flex flex-col items-center text-center">
        {/* 상단 회차/누적 뱃지 */}
        <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-white border-2 border-nyang-300 px-3 py-1 font-extrabold text-nyang-700 shadow-pop">
            🎯 1게임 · {game1.round}회차
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white border-2 border-plasma-300 px-3 py-1 font-extrabold text-plasma-700 shadow-pop">
            🏆 {game1.winners.length} / {PRIZE_PER_GAME}
          </span>
        </div>
        <h3 className="relative z-10 mt-3 font-cute text-2xl sm:text-3xl font-black nyang-gradient-text">
          1의 자리 숫자를 맞춰라!
        </h3>
        <p className="relative z-10 text-xs text-crossing-shadow mt-1">
          본인 점수의 1의 자리가 룰렛 숫자와 같으면 잭팟!
        </p>

        <div className="relative z-10 mt-2 w-full">
          <JackpotStage intensity="bold">
            <JackpotRoulette
              kind="ones"
              spinId={roulette.spinId ?? 0}
              result={roulette.result}
              unitLabel="이번 라운드 1의 자리"
            />
          </JackpotStage>
        </div>

        {showCandidates && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 w-full"
          >
            <div className="text-sm font-bold text-crossing-shadow">
              매칭된 참가자
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {game1.candidates.map((id, i) => (
                <WinnerCard
                  key={id}
                  name={nameOf(id)}
                  subtitle={`1의 자리 ${roulette.result}`}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}

        {noMatch && (
          <div className="mt-4 rounded-xl bg-amber-100 border-2 border-amber-300 px-4 py-3 text-sm text-amber-900">
            결과 <b>{roulette.result}</b>… 이번엔 매칭된 사람이 없어요. 다시
            돌려볼까요? 🌀
          </div>
        )}
      </div>

      {game1.winners.length > 0 && (
        <div className="crossing-frame p-4">
          <div className="text-sm font-bold text-crossing-shadow">
            지금까지 확정된 1게임 당첨자
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {game1.winners.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-nyang-100 border border-nyang-300 px-3 py-1 text-sm font-extrabold text-nyang-700"
              >
                🏆 {nameOf(id)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RPS 진행 보드                                                       */
/* ------------------------------------------------------------------ */

function RpsBoard({
  room,
  game,
  nameOf,
}: {
  room: Room;
  game: 1 | 2;
  nameOf: (id: string) => string;
}) {
  const rps =
    game === 1 ? room.game_state.game1.rps : room.game_state.game2.rps;
  if (!rps) return null;
  const picked = new Set(rps.picked_winners);

  const reasonText =
    rps.reason === "tie"
      ? "동점자가 나왔어요! 가위바위보로 정해요."
      : "당첨자가 너무 많아요! 가위바위보로 정해요.";

  return (
    <div className="crossing-frame p-5 space-y-4 text-center">
      <div className="text-4xl">✊ ✌️ ✋</div>
      <h3 className="font-cute text-2xl font-extrabold text-crossing-ink">
        가위! 바위! 보!
      </h3>
      <p className="text-sm text-crossing-shadow">{reasonText}</p>
      <p className="text-sm text-crossing-shadow">
        운영자가 승자를 선택할 거예요 ({rps.picked_winners.length} / {rps.need})
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rps.candidates.map((id) => {
          const isWinner = picked.has(id);
          return (
            <li
              key={id}
              className={
                "rounded-2xl border-4 px-4 py-3 text-lg font-extrabold transition " +
                (isWinner
                  ? "border-nyang-400 bg-gradient-to-b from-yellow-100 to-nyang-100 shadow-pop animate-bounceSoft"
                  : "border-crossing-frame/40 bg-white/80 text-crossing-ink")
              }
            >
              {isWinner ? "🏆 " : "🤜 "}
              {nameOf(id)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 당첨자 표시 (1게임 끝, 또는 단계별)                                  */
/* ------------------------------------------------------------------ */

function WinnersBoard({
  title,
  subtitle,
  winnerIds,
  nameOf,
  showConfetti,
}: {
  title: string;
  subtitle?: string;
  winnerIds: string[];
  nameOf: (id: string) => string;
  showConfetti?: boolean;
}) {
  return (
    <div className="wafer-card relative p-6 text-center space-y-4">
      {showConfetti && <Confetti />}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <NyangHero size={200} withChambers={false} />
        <motion.div
          initial={{ scale: 0.4, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <div className="text-4xl">🎉</div>
          <h3 className="font-cute text-3xl sm:text-4xl font-black nyang-gradient-text">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-plasma-600 font-bold mt-1">{subtitle}</p>
          )}
        </motion.div>
      </div>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {winnerIds.map((id, i) => (
          <WinnerCard
            key={id}
            name={nameOf(id)}
            subtitle={`당첨 #${i + 1}`}
            index={i}
            big
          />
        ))}
      </div>
      <div className="relative z-10 font-cute text-2xl font-black nyang-gradient-text pt-2">
        축하드립니다! 🥳
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2게임 등수 공개 보드                                                 */
/* ------------------------------------------------------------------ */

function RankingBoard({ participants }: { participants: Participant[] }) {
  const groups = useMemo(() => {
    const map = groupByRank(participants, 2);
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [participants]);
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));

  return (
    <div className="crossing-frame p-5 space-y-3">
      <div className="text-center">
        <h3 className="font-cute text-2xl font-extrabold text-crossing-ink">
          🏁 2게임 등수
        </h3>
        <p className="text-sm text-crossing-shadow">
          잠시 후 1~{groups.length}등 중 룰렛을 돌릴게요!
        </p>
      </div>
      <ul className="space-y-2">
        {groups.map(([rank, ids], gi) => (
          <motion.li
            key={rank}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: gi * 0.08 }}
            className="flex items-center gap-3 rounded-2xl bg-white/95 border-2 border-crossing-frame px-4 py-2 shadow-pop"
          >
            <span className="font-cute text-2xl font-extrabold text-nyang-600 w-12">
              {rank}등
            </span>
            <span className="flex-1 truncate font-bold text-crossing-ink">
              {ids.map((id) => nameMap.get(id)).join(", ")}
            </span>
            <span className="font-mono font-extrabold text-crossing-shadow">
              {
                participants.find((p) => p.id === ids[0])?.game2_score ?? "-"
              }
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2게임 룰렛 보드                                                     */
/* ------------------------------------------------------------------ */

function Game2RouletteBoard({
  room,
  participants,
  nameOf,
}: {
  room: Room;
  participants: Participant[];
  nameOf: (id: string) => string;
}) {
  const { game2, roulette } = room.game_state;
  const rankMap = useMemo(() => groupByRank(participants, 2), [participants]);
  const maxRank = Math.max(...Array.from(rankMap.keys()), 1);

  const showCurrent =
    !roulette.spinning && roulette.result != null && game2.current != null;

  return (
    <div className="space-y-4">
      <div className="wafer-card relative p-5 sm:p-6 flex flex-col items-center text-center">
        <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-white border-2 border-plasma-300 px-3 py-1 font-extrabold text-plasma-700 shadow-pop">
            🏁 2게임 · {game2.spin_count}회차
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white border-2 border-nyang-300 px-3 py-1 font-extrabold text-nyang-700 shadow-pop">
            🏆 {game2.winners.length} / {PRIZE_PER_GAME}
          </span>
        </div>
        <h3 className="relative z-10 mt-3 font-cute text-2xl sm:text-3xl font-black nyang-gradient-text">
          1등 ~ {maxRank}등 잭팟!
        </h3>
        <p className="relative z-10 text-xs text-crossing-shadow mt-1">
          뽑힌 등수에 해당하는 분이 당첨이에요.
        </p>

        <div className="relative z-10 mt-2 w-full">
          <JackpotStage intensity="bold">
            <JackpotRoulette
              kind="rank"
              max={maxRank}
              spinId={roulette.spinId ?? 0}
              result={roulette.result}
              unitLabel="이번 라운드 등수"
            />
          </JackpotStage>
        </div>

        {showCurrent && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 w-full"
          >
            <div className="text-sm font-bold text-crossing-shadow">
              {game2.current!.rank}등 →
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {game2.current!.ids.length === 0 ? (
                <div className="rounded-xl bg-amber-100 border-2 border-amber-300 px-4 py-3 text-sm text-amber-900">
                  이미 모두 당첨된 등수예요. 다시 돌릴게요.
                </div>
              ) : (
                game2.current!.ids.map((id, i) => (
                  <WinnerCard
                    key={id}
                    name={nameOf(id)}
                    subtitle={`${game2.current!.rank}등`}
                    index={i}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {game2.winners.length > 0 && (
        <div className="crossing-frame p-4">
          <div className="text-sm font-bold text-crossing-shadow">
            지금까지 확정된 2게임 당첨자
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {game2.winners.map((id, i) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-nyang-100 border border-nyang-300 px-3 py-1 text-sm font-extrabold text-nyang-700"
              >
                🏆 #{i + 1} {nameOf(id)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 최종 결과                                                           */
/* ------------------------------------------------------------------ */

function FinishedBoard({
  room,
  participants,
  nameOf,
}: {
  room: Room;
  participants: Participant[];
  nameOf: (id: string) => string;
}) {
  const winners1 = room.game_state.game1.winners;
  const winners2 = room.game_state.game2.winners;
  return (
    <div className="space-y-4">
      <Confetti />
      <div className="wafer-card relative p-6 text-center overflow-visible">
        <div className="relative z-10 flex flex-col items-center">
          <NyangHero size={280} />
          <motion.div
            initial={{ scale: 0.4, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className="mt-2"
          >
            <div className="text-5xl">🎊</div>
            <h3 className="font-cute text-3xl sm:text-4xl font-black nyang-gradient-text">
              모든 게임 종료!
            </h3>
            <p className="text-sm text-plasma-600 font-bold mt-1">
              배민 5만원권 <span className="text-nyang-600">8장</span>의 주인이 결정됐어요 🍔
            </p>
          </motion.div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="wafer-card relative p-5">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎯</span>
              <h4 className="font-cute text-xl font-extrabold text-nyang-700">
                1게임 당첨자
              </h4>
            </div>
            <div className="space-y-2">
              {winners1.map((id, i) => (
                <WinnerCard key={id} name={nameOf(id)} subtitle="1게임" index={i} />
              ))}
              {winners1.length === 0 && (
                <p className="text-sm text-crossing-shadow/70">
                  아직 결과 없음
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="wafer-card relative p-5">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏁</span>
              <h4 className="font-cute text-xl font-extrabold text-plasma-700">
                2게임 당첨자
              </h4>
            </div>
            <div className="space-y-2">
              {winners2.map((id, i) => {
                const p = participants.find((x) => x.id === id);
                return (
                  <WinnerCard
                    key={id}
                    name={nameOf(id)}
                    subtitle={
                      p?.game2_score != null
                        ? `2게임 · ${p.game2_score}점`
                        : "2게임"
                    }
                    index={i}
                  />
                );
              })}
              {winners2.length === 0 && (
                <p className="text-sm text-crossing-shadow/70">
                  아직 결과 없음
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="font-cute text-3xl font-black text-center nyang-gradient-text pb-2">
        축하드립니다! 🧡
      </div>
    </div>
  );
}
