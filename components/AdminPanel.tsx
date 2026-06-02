"use client";

import { useEffect, useMemo, useState } from "react";
import type { Participant, Room, RoomStatus } from "@/lib/types";
import { PRIZE_PER_GAME } from "@/lib/types";
import { groupByRank, statusLabel } from "@/lib/game";
import {
  addParticipant,
  forceEndGame1,
  forceEndGame2,
  pickRpsWinnerGame1,
  pickRpsWinnerGame2,
  removeParticipant,
  resetRoom,
  resolveGame1Roulette,
  resolveGame2Roulette,
  setParticipantScore,
  setStatus,
  showGame2Ranking,
  spinGame1,
  spinGame2,
  startGame1,
  startGame1Roulette,
  startGame2,
  startGame2Roulette,
} from "@/lib/gameActions";

interface Props {
  room: Room;
  participants: Participant[];
}

export default function AdminPanel({ room, participants }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(fn: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border-4 border-nyang-500 bg-white/95 shadow-pop">
      <div className="flex items-center justify-between border-b-2 border-nyang-200 px-4 py-2 bg-nyang-50 rounded-t-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-nyang-500 animate-pulse" />
          <span className="text-sm font-extrabold text-nyang-700">
            운영자 컨트롤 · {statusLabel(room.status)}
          </span>
        </div>
        <span className="text-[11px] text-crossing-shadow">
          참가자 {participants.length}명
        </span>
      </div>
      <div className="p-4 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {room.status === "lobby" && (
          <LobbyControls room={room} participants={participants} action={action} />
        )}

        {(room.status === "game1_input" || room.status === "game2_input") && (
          <ScoreInputControls
            room={room}
            participants={participants}
            action={action}
            game={room.status === "game1_input" ? 1 : 2}
          />
        )}

        {room.status === "game1_roulette" && (
          <Game1RouletteControls
            room={room}
            participants={participants}
            action={action}
          />
        )}

        {room.status === "game1_rps" && (
          <Game1RpsControls
            room={room}
            participants={participants}
            action={action}
          />
        )}

        {room.status === "game1_done" && (
          <Game1DoneControls room={room} action={action} />
        )}

        {room.status === "game2_ranking" && (
          <Game2RankingControls room={room} action={action} />
        )}

        {room.status === "game2_roulette" && (
          <Game2RouletteControls
            room={room}
            participants={participants}
            action={action}
          />
        )}

        {room.status === "game2_rps" && (
          <Game2RpsControls
            room={room}
            participants={participants}
            action={action}
          />
        )}

        {room.status === "finished" && (
          <FinishedControls room={room} action={action} />
        )}

        {/* 어떤 상태에서든 강제 단계 이동 */}
        <details className="text-xs text-crossing-shadow">
          <summary className="cursor-pointer select-none">
            ⚙️ 단계 강제 이동 (긴급용)
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              [
                "lobby",
                "game1_input",
                "game1_roulette",
                "game1_done",
                "game2_input",
                "game2_ranking",
                "game2_roulette",
                "finished",
              ] as RoomStatus[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => action(() => setStatus(room, s))}
                className="rounded-md border border-crossing-frame/40 px-2 py-1 hover:bg-nyang-50"
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => {
                if (confirm("정말 모든 점수/당첨을 초기화하고 lobby로 돌릴까요?"))
                  action(() => resetRoom(room));
              }}
              className="rounded-md border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
            >
              방 전체 리셋
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LOBBY                                                              */
/* ------------------------------------------------------------------ */

function LobbyControls({
  room,
  participants,
  action,
}: {
  room: Room;
  participants: Participant[];
  action: (fn: () => Promise<unknown>) => void;
}) {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/r/${room.code}`;
  }, [room.code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-crossing-paper border-2 border-crossing-frame p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-crossing-shadow">
          참가자 입장 링크
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-xl border border-crossing-frame/40 bg-white px-3 py-2 font-mono text-sm"
          />
          <button
            onClick={copy}
            className="rounded-xl bg-nyang-500 hover:bg-nyang-600 text-white text-sm font-bold px-3 py-2"
          >
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
        <div className="mt-1 text-[11px] text-crossing-shadow">
          방 코드: <span className="font-mono font-extrabold">{room.code}</span>
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-crossing-ink mb-1">
          참가자 등록
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const v = name.trim();
            setName("");
            action(() => addParticipant(room.id, v));
          }}
          className="flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력 후 Enter"
            className="flex-1 rounded-xl border-2 border-crossing-frame/40 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nyang-400"
          />
          <button
            type="submit"
            className="rounded-xl bg-crossing-frame text-white font-bold px-4 py-2"
          >
            추가
          </button>
        </form>
        <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {participants.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white border border-crossing-frame/30 px-3 py-1.5 text-sm"
            >
              <span className="font-bold text-crossing-ink truncate">
                {p.name}
              </span>
              <button
                onClick={() => {
                  if (confirm(`'${p.name}' 참가자를 삭제할까요?`))
                    action(() => removeParticipant(p.id));
                }}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                삭제
              </button>
            </li>
          ))}
          {participants.length === 0 && (
            <li className="text-xs text-crossing-shadow/70 italic">
              아직 참가자가 없어요. 이름을 추가해 주세요.
            </li>
          )}
        </ul>
      </div>

      <button
        onClick={() => {
          if (participants.length === 0) {
            alert("참가자를 1명 이상 등록해 주세요.");
            return;
          }
          action(() => startGame1(room));
        }}
        className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
      >
        🎳 1게임 시작
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SCORE INPUT (게임1/2 공통)                                          */
/* ------------------------------------------------------------------ */

function ScoreInputControls({
  room,
  participants,
  action,
  game,
}: {
  room: Room;
  participants: Participant[];
  action: (fn: () => Promise<unknown>) => void;
  game: 1 | 2;
}) {
  // 로컬 입력 상태 (한 번에 다 입력하고 일괄 저장)
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => {
    // 참가자가 늘어났을 때 빈 칸 보존
    setDraft((cur) => {
      const next: Record<string, string> = { ...cur };
      participants.forEach((p) => {
        const existing = game === 1 ? p.game1_score : p.game2_score;
        if (next[p.id] == null) {
          next[p.id] = existing != null ? String(existing) : "";
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.length]);

  const filledCount = participants.filter((p) => {
    const s = game === 1 ? p.game1_score : p.game2_score;
    return s != null;
  }).length;
  const allFilled = filledCount === participants.length && participants.length > 0;

  async function saveOne(participantId: string) {
    const raw = draft[participantId];
    if (raw == null || raw === "") {
      await setParticipantScore(participantId, game, null);
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num) || num < 0 || num > 300) {
      throw new Error("점수는 0~300 사이의 숫자만 가능해요.");
    }
    await setParticipantScore(participantId, game, num);
  }

  async function saveAll() {
    for (const p of participants) {
      const raw = draft[p.id];
      if (raw == null) continue;
      const num = raw === "" ? null : Number(raw);
      if (num != null && (Number.isNaN(num) || num < 0 || num > 300)) {
        throw new Error(`'${p.name}' 의 점수가 올바르지 않아요.`);
      }
      const existing = game === 1 ? p.game1_score : p.game2_score;
      if ((num ?? null) !== (existing ?? null)) {
        await setParticipantScore(p.id, game, num);
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-crossing-shadow">
        진행: <b>{filledCount}</b> / {participants.length} 명 입력 완료
      </div>
      <ul className="space-y-1.5">
        {participants.map((p) => {
          const existing = game === 1 ? p.game1_score : p.game2_score;
          const value = draft[p.id] ?? (existing != null ? String(existing) : "");
          return (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-xl bg-white border border-crossing-frame/30 px-3 py-1.5"
            >
              <span className="flex-1 truncate font-bold text-crossing-ink text-sm">
                {p.name}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={value}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [p.id]: e.target.value }))
                }
                onBlur={() => action(() => saveOne(p.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="점수"
                min={0}
                max={300}
                className="w-24 rounded-lg border-2 border-crossing-frame/40 bg-white px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-nyang-400"
              />
              <span className="text-xs text-crossing-shadow">점</span>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2">
        <button
          onClick={() => action(saveAll)}
          className="flex-1 rounded-2xl bg-crossing-frame hover:bg-crossing-shadow text-white font-bold py-2.5"
        >
          전부 저장
        </button>
        <button
          onClick={() => {
            if (!allFilled) {
              if (!confirm("아직 모든 점수를 입력하지 않았어요. 그래도 진행할까요?"))
                return;
            }
            if (game === 1) {
              action(() => startGame1Roulette(room));
            } else {
              action(() => showGame2Ranking(room));
            }
          }}
          className="flex-1 rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold py-2.5 shadow-pop"
        >
          {game === 1 ? "🎰 룰렛으로" : "🏁 등수 공개"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GAME 1 ROULETTE                                                    */
/* ------------------------------------------------------------------ */

function Game1RouletteControls({
  room,
  participants,
  action,
}: {
  room: Room;
  participants: Participant[];
  action: (fn: () => Promise<unknown>) => void;
}) {
  const { game1, roulette } = room.game_state;
  const hasResult = !roulette.spinning && roulette.result != null;
  const remainingNeed = PRIZE_PER_GAME - game1.winners.length;

  return (
    <div className="space-y-3">
      <div className="text-sm text-crossing-shadow">
        남은 시상: <b className="text-nyang-700">{remainingNeed}</b>장 · 룰렛{" "}
        {game1.round}회차
      </div>

      {!roulette.spinning && !hasResult && (
        <button
          onClick={() => action(() => spinGame1(room, participants))}
          className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
        >
          🎰 룰렛 돌리기
        </button>
      )}

      {roulette.spinning && (
        <div className="rounded-xl bg-nyang-50 border-2 border-nyang-300 px-4 py-3 text-sm text-nyang-700 font-bold animate-pulse text-center">
          🌀 룰렛이 돌아가는 중입니다...
        </div>
      )}

      {hasResult && (
        <div className="space-y-2">
          <div className="rounded-xl bg-white border-2 border-nyang-300 px-4 py-3 text-sm text-crossing-ink">
            룰렛 결과: <b className="text-nyang-700">{roulette.result}</b> ·
            매칭 인원 <b>{game1.candidates.length}</b>명
            {game1.winners.length + game1.candidates.length > PRIZE_PER_GAME && (
              <span className="ml-2 text-amber-700 font-bold">
                → 가위바위보 진행 필요
              </span>
            )}
          </div>
          <button
            onClick={() =>
              action(() => resolveGame1Roulette(room, PRIZE_PER_GAME))
            }
            className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
          >
            ✅ 결과 확정 (다음 단계로)
          </button>
        </div>
      )}

      <button
        onClick={() => {
          if (
            confirm(
              "1게임을 강제로 종료할까요? 현재까지 당첨된 사람들로 마무리됩니다.",
            )
          )
            action(() => forceEndGame1(room));
        }}
        className="w-full rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold py-2"
      >
        1게임 강제 종료
      </button>
    </div>
  );
}

function Game1RpsControls({
  room,
  participants,
  action,
}: {
  room: Room;
  participants: Participant[];
  action: (fn: () => Promise<unknown>) => void;
}) {
  const rps = room.game_state.game1.rps;
  if (!rps) return null;
  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name ?? "(?)";
  const remaining = rps.need - rps.picked_winners.length;
  return (
    <div className="space-y-3">
      <div className="text-sm text-crossing-shadow">
        가위바위보 결과를 보고 승자를 <b>{remaining}</b>명 더 골라주세요.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rps.candidates.map((id) => {
          const picked = rps.picked_winners.includes(id);
          return (
            <button
              key={id}
              disabled={picked || remaining <= 0}
              onClick={() =>
                action(() => pickRpsWinnerGame1(room, id, PRIZE_PER_GAME))
              }
              className={
                "rounded-2xl px-4 py-3 text-left font-bold transition " +
                (picked
                  ? "bg-nyang-100 border-2 border-nyang-400 text-nyang-700"
                  : "bg-white border-2 border-crossing-frame/40 hover:bg-nyang-50")
              }
            >
              {picked ? "🏆 " : "✊✌️✋ "} {nameOf(id)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Game1DoneControls({
  room,
  action,
}: {
  room: Room;
  action: (fn: () => Promise<unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-crossing-shadow">
        1게임 시상이 완료되었습니다. 이어서 2게임을 시작하세요.
      </div>
      <button
        onClick={() => action(() => startGame2(room))}
        className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
      >
        🎳 2게임 시작
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GAME 2                                                             */
/* ------------------------------------------------------------------ */

function Game2RankingControls({
  room,
  action,
}: {
  room: Room;
  action: (fn: () => Promise<unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-crossing-shadow">
        등수를 보여주고 있어요. 모두에게 보여줬다면 룰렛을 시작하세요.
      </div>
      <button
        onClick={() => action(() => startGame2Roulette(room))}
        className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
      >
        🎰 2게임 룰렛 시작
      </button>
    </div>
  );
}

function Game2RouletteControls({
  room,
  participants,
  action,
}: {
  room: Room;
  participants: Participant[];
  action: (fn: () => Promise<unknown>) => void;
}) {
  const { game2, roulette } = room.game_state;
  const hasResult = !roulette.spinning && roulette.result != null && game2.current != null;
  const empty = !roulette.spinning && roulette.result != null && (game2.current?.ids.length ?? 0) === 0;
  const ranksLeft = useMemo(() => {
    const map = groupByRank(participants, 2);
    const winSet = new Set(game2.winners);
    return Array.from(map.entries()).filter(([, ids]) => ids.some((i) => !winSet.has(i)));
  }, [participants, game2.winners]);

  return (
    <div className="space-y-3">
      <div className="text-sm text-crossing-shadow">
        2게임 남은 시상:{" "}
        <b className="text-nyang-700">{PRIZE_PER_GAME - game2.winners.length}</b>장 ·{" "}
        {game2.spin_count}회차 · 뽑을 수 있는 등수 {ranksLeft.length}개
      </div>
      {!roulette.spinning && !hasResult && !empty && (
        <button
          onClick={() => action(() => spinGame2(room, participants))}
          className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
        >
          🎰 룰렛 돌리기
        </button>
      )}
      {roulette.spinning && (
        <div className="rounded-xl bg-nyang-50 border-2 border-nyang-300 px-4 py-3 text-sm text-nyang-700 font-bold animate-pulse text-center">
          🌀 룰렛이 돌아가는 중입니다...
        </div>
      )}
      {empty && (
        <button
          onClick={() => action(() => spinGame2(room, participants))}
          className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
        >
          🎲 다시 돌리기 (해당 등수에 후보 없음)
        </button>
      )}
      {hasResult && !empty && (
        <button
          onClick={() => action(() => resolveGame2Roulette(room, PRIZE_PER_GAME))}
          className="w-full rounded-2xl bg-nyang-500 hover:bg-nyang-600 text-white font-extrabold text-lg py-3 shadow-pop"
        >
          ✅ 결과 확정 (다음 단계로)
        </button>
      )}

      <button
        onClick={() => {
          if (
            confirm(
              "2게임을 강제로 종료할까요? 현재까지 당첨된 사람들로 마무리됩니다.",
            )
          )
            action(() => forceEndGame2(room));
        }}
        className="w-full rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold py-2"
      >
        2게임 강제 종료
      </button>
    </div>
  );
}

function Game2RpsControls({
  room,
  participants,
  action,
}: {
  room: Room;
  participants: Participant[];
  action: (fn: () => Promise<unknown>) => void;
}) {
  const rps = room.game_state.game2.rps;
  if (!rps) return null;
  const nameOf = (id: string) =>
    participants.find((p) => p.id === id)?.name ?? "(?)";
  return (
    <div className="space-y-3">
      <div className="text-sm text-crossing-shadow">
        동점자 가위바위보 - 승자를 1명 골라주세요.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rps.candidates.map((id) => (
          <button
            key={id}
            onClick={() =>
              action(() => pickRpsWinnerGame2(room, id, PRIZE_PER_GAME))
            }
            className="rounded-2xl px-4 py-3 text-left font-bold bg-white border-2 border-crossing-frame/40 hover:bg-nyang-50"
          >
            ✊✌️✋ {nameOf(id)}
          </button>
        ))}
      </div>
    </div>
  );
}

function FinishedControls({
  room,
  action,
}: {
  room: Room;
  action: (fn: () => Promise<unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-crossing-shadow">
        모든 게임이 끝났어요 🎉 수고하셨습니다!
      </div>
      <button
        onClick={() => {
          if (
            confirm(
              "방의 모든 점수/당첨을 초기화하고 다시 시작할까요? (참가자 명단은 유지됩니다)",
            )
          )
            action(() => resetRoom(room));
        }}
        className="w-full rounded-2xl bg-crossing-frame text-white font-bold py-3"
      >
        🔄 방 다시 시작 (참가자 유지)
      </button>
    </div>
  );
}
