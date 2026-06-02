"use client";

import { getSupabase } from "./supabase";
import {
  findOnesDigitMatch,
  freshGameState,
  groupByRank,
  onesDigit,
  rollRoulette,
} from "./game";
import type {
  GameState,
  Participant,
  Room,
  RoomStatus,
  RpsState,
} from "./types";

/**
 * 모든 운영자 액션을 한 모듈에 모아둡니다.
 * 각 함수는 (room, participants, ...) 를 받아서 Supabase 업데이트를 수행합니다.
 *
 * 게임 진행은 phase 와 game_state 만 바꾸어도 모든 클라이언트가 같은 화면을 보게 됩니다.
 */

async function updateRoom(roomId: string, patch: Partial<Room>) {
  const supabase = getSupabase();
  const { error } = await supabase.from("rooms").update(patch).eq("id", roomId);
  if (error) throw new Error(error.message);
}

async function updateParticipant(id: string, patch: Partial<Participant>) {
  const supabase = getSupabase();
  const { error } = await supabase.from("participants").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/* 참가자 관리                                                         */
/* ------------------------------------------------------------------ */

export async function addParticipant(roomId: string, name: string) {
  const supabase = getSupabase();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("이름을 입력해 주세요.");
  const { error } = await supabase
    .from("participants")
    .insert({ room_id: roomId, name: trimmed });
  if (error) throw new Error(error.message);
}

export async function removeParticipant(participantId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);
  if (error) throw new Error(error.message);
}

export async function setParticipantScore(
  participantId: string,
  game: 1 | 2,
  score: number | null,
) {
  const field = game === 1 ? "game1_score" : "game2_score";
  await updateParticipant(participantId, { [field]: score } as Partial<Participant>);
}

/* ------------------------------------------------------------------ */
/* 상태 전환                                                           */
/* ------------------------------------------------------------------ */

export async function setStatus(room: Room, status: RoomStatus, patch?: Partial<GameState>) {
  const next: GameState = {
    ...room.game_state,
    ...patch,
    phase: status,
  };
  await updateRoom(room.id, { status, game_state: next });
}

export async function startGame1(room: Room) {
  await setStatus(room, "game1_input");
}

export async function startGame1Roulette(room: Room) {
  await setStatus(room, "game1_roulette", {
    roulette: { spinning: false, result: null, kind: "ones", spinId: 0 },
    game1: { winners: [], candidates: [], rps: null, round: 0 },
  });
}

export async function spinGame1(room: Room, participants: Participant[]) {
  // 균등하지만 적당히 "재미있는" 결과: 매칭자가 0명일 때 한 번 더 굴려서 매칭자 ≥ 1 보장.
  // (행사 분위기를 위해. 0이 자주 나오면 분위기 떨어지므로 살짝 펌프업.)
  const winners = room.game_state.game1.winners;
  let result = rollRoulette("ones", 10);
  let matches = findOnesDigitMatch(participants, result, winners);
  if (matches.length === 0) {
    // 남은 후보들 중에서 하나의 1의자리를 강제로 선택. 0명 매칭이 두 번 연속 나오는 건 분위기를 깸.
    const remaining = participants.filter(
      (p) =>
        !winners.includes(p.id) && p.game1_score != null,
    );
    if (remaining.length > 0) {
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      result = onesDigit(pick.game1_score!);
      matches = findOnesDigitMatch(participants, result, winners);
    }
  }
  const round = room.game_state.game1.round + 1;
  const spinId = (room.game_state.roulette.spinId ?? 0) + 1;
  await updateRoom(room.id, {
    game_state: {
      ...room.game_state,
      roulette: { spinning: true, result, kind: "ones", spinId },
      game1: {
        ...room.game_state.game1,
        candidates: matches,
        round,
      },
    },
  });
}

/** 룰렛 회전이 끝나고 운영자가 "결과 처리" 를 눌렀을 때 호출 */
export async function resolveGame1Roulette(room: Room, prizeBudget: number) {
  const { game1 } = room.game_state;
  const totalIfAdded = game1.winners.length + game1.candidates.length;

  if (game1.candidates.length === 0) {
    // 아무도 매칭되지 않음. 그냥 후보만 비우고 다시 돌릴 수 있게 함.
    await updateRoom(room.id, {
      game_state: {
        ...room.game_state,
        game1: { ...game1, candidates: [] },
        roulette: { ...room.game_state.roulette, spinning: false },
      },
    });
    return;
  }

  if (totalIfAdded <= prizeBudget) {
    // 후보 전원 시상
    const newWinners = [...game1.winners, ...game1.candidates];
    const done = newWinners.length >= prizeBudget;
    await markGame1Winners(room, newWinners);
    await updateRoom(room.id, {
      status: done ? "game1_done" : "game1_roulette",
      game_state: {
        ...room.game_state,
        phase: done ? "game1_done" : "game1_roulette",
        game1: { ...game1, winners: newWinners, candidates: [] },
        // 시상 후엔 룰렛 result 도 초기화 → 운영자에게 다시 "🎰 룰렛 돌리기" 버튼이 보임
        roulette: {
          spinning: false,
          result: null,
          kind: "ones",
          spinId: room.game_state.roulette.spinId ?? 0,
        },
      },
    });
  } else {
    // 초과 → RPS
    const need = prizeBudget - game1.winners.length;
    const rps: RpsState = {
      candidates: game1.candidates,
      picked_winners: [],
      need,
      reason: "overflow",
    };
    await updateRoom(room.id, {
      status: "game1_rps",
      game_state: {
        ...room.game_state,
        phase: "game1_rps",
        game1: { ...game1, rps, candidates: [] },
        roulette: { ...room.game_state.roulette, spinning: false },
      },
    });
  }
}

/** 가위바위보로 한 명 픽 */
export async function pickRpsWinnerGame1(room: Room, participantId: string, prizeBudget: number) {
  const { game1 } = room.game_state;
  if (!game1.rps) return;
  if (game1.rps.picked_winners.includes(participantId)) return;
  const nextPicked = [...game1.rps.picked_winners, participantId];
  const filled = nextPicked.length >= game1.rps.need;
  if (filled) {
    const newWinners = [...game1.winners, ...nextPicked];
    await markGame1Winners(room, newWinners);
    await updateRoom(room.id, {
      status: "game1_done",
      game_state: {
        ...room.game_state,
        phase: "game1_done",
        game1: { ...game1, winners: newWinners, rps: null },
      },
    });
    if (newWinners.length < prizeBudget) {
      // 가위바위보로 결정한 인원이 부족 (이론상 없음). 무시.
    }
  } else {
    await updateRoom(room.id, {
      game_state: {
        ...room.game_state,
        game1: { ...game1, rps: { ...game1.rps, picked_winners: nextPicked } },
      },
    });
  }
}

/** 1게임 강제 종료 (참가자가 적을 때 사용) */
export async function forceEndGame1(room: Room) {
  const { game1 } = room.game_state;
  await markGame1Winners(room, game1.winners);
  await setStatus(room, "game1_done", {
    game1: { ...game1, candidates: [], rps: null },
    roulette: { ...room.game_state.roulette, spinning: false },
  });
}

async function markGame1Winners(room: Room, winnerIds: string[]) {
  const supabase = getSupabase();
  // 단순화를 위해 일괄 업데이트
  for (const id of winnerIds) {
    await supabase.from("participants").update({ game1_won: true }).eq("id", id);
  }
}

/* ------------------------------------------------------------------ */
/* 2게임                                                              */
/* ------------------------------------------------------------------ */

export async function startGame2(room: Room) {
  await setStatus(room, "game2_input", {
    game2: { winners: [], current: null, rps: null, spin_count: 0 },
    roulette: { spinning: false, result: null, kind: "rank", spinId: room.game_state.roulette.spinId ?? 0 },
  });
}

export async function showGame2Ranking(room: Room) {
  await setStatus(room, "game2_ranking");
}

export async function startGame2Roulette(room: Room) {
  await setStatus(room, "game2_roulette");
}

export async function spinGame2(room: Room, participants: Participant[]) {
  const ranksMap = groupByRank(participants, 2);
  const validRanks = Array.from(ranksMap.entries())
    .filter(([rank, ids]) => {
      // 이미 당첨된 참가자만 있는 등수는 제외
      const winners = new Set(room.game_state.game2.winners);
      return ids.some((id) => !winners.has(id));
    })
    .map(([rank]) => rank);
  if (validRanks.length === 0) {
    throw new Error("더 이상 뽑을 등수가 없습니다.");
  }
  // 균등 랜덤
  const pickedRank = validRanks[Math.floor(Math.random() * validRanks.length)];
  const idsAtRank = (ranksMap.get(pickedRank) ?? []).filter(
    (id) => !room.game_state.game2.winners.includes(id),
  );
  const spinId = (room.game_state.roulette.spinId ?? 0) + 1;
  // 룰렛은 1~N(=가장 큰 등수) 슬롯이므로, max 는 ranks 의 최대값
  const max = Math.max(...Array.from(ranksMap.keys()));
  await updateRoom(room.id, {
    game_state: {
      ...room.game_state,
      roulette: { spinning: true, result: pickedRank, kind: "rank", spinId },
      game2: {
        ...room.game_state.game2,
        current: { rank: pickedRank, ids: idsAtRank },
        spin_count: room.game_state.game2.spin_count + 1,
      },
    },
  });
  // max 는 컴포넌트로 props 전달 (페이지에서 룰렛 표시 시)
  return max;
}

/** 게임2 룰렛 결과 처리 */
export async function resolveGame2Roulette(room: Room, prizeBudget: number) {
  const { game2 } = room.game_state;
  if (!game2.current) return;
  const ids = game2.current.ids;
  if (ids.length === 1) {
    // 단일 당첨
    const winnerId = ids[0];
    const newWinners = [...game2.winners, winnerId];
    await markGame2Winner(winnerId);
    const filled = newWinners.length >= prizeBudget;
    await updateRoom(room.id, {
      status: filled ? "finished" : "game2_roulette",
      game_state: {
        ...room.game_state,
        phase: filled ? "finished" : "game2_roulette",
        game2: { ...game2, winners: newWinners, current: null },
        roulette: {
          spinning: false,
          result: null,
          kind: "rank",
          spinId: room.game_state.roulette.spinId ?? 0,
        },
      },
    });
  } else if (ids.length > 1) {
    // 동점 → RPS
    const rps: RpsState = {
      candidates: ids,
      picked_winners: [],
      need: 1,
      reason: "tie",
    };
    await updateRoom(room.id, {
      status: "game2_rps",
      game_state: {
        ...room.game_state,
        phase: "game2_rps",
        game2: { ...game2, rps },
        roulette: { ...room.game_state.roulette, spinning: false },
      },
    });
  } else {
    // 빈 등수 - 다시 굴리도록 클리어
    await updateRoom(room.id, {
      game_state: {
        ...room.game_state,
        game2: { ...game2, current: null },
        roulette: {
          spinning: false,
          result: null,
          kind: "rank",
          spinId: room.game_state.roulette.spinId ?? 0,
        },
      },
    });
  }
}

export async function pickRpsWinnerGame2(room: Room, participantId: string, prizeBudget: number) {
  const { game2 } = room.game_state;
  if (!game2.rps) return;
  if (!game2.rps.candidates.includes(participantId)) return;
  // 게임2는 항상 need=1 (동점자 중 1명)
  const newWinners = [...game2.winners, participantId];
  await markGame2Winner(participantId);
  const filled = newWinners.length >= prizeBudget;
  await updateRoom(room.id, {
    status: filled ? "finished" : "game2_roulette",
    game_state: {
      ...room.game_state,
      phase: filled ? "finished" : "game2_roulette",
      game2: { ...game2, winners: newWinners, current: null, rps: null },
      // 다음 라운드로 진행할 때 룰렛 버튼이 다시 표시되도록 result 초기화
      roulette: {
        spinning: false,
        result: null,
        kind: "rank",
        spinId: room.game_state.roulette.spinId ?? 0,
      },
    },
  });
}

export async function forceEndGame2(room: Room) {
  await setStatus(room, "finished", {
    game2: { ...room.game_state.game2, current: null, rps: null },
    roulette: { ...room.game_state.roulette, spinning: false },
  });
}

async function markGame2Winner(id: string) {
  const supabase = getSupabase();
  await supabase.from("participants").update({ game2_won: true }).eq("id", id);
}

export async function resetRoom(room: Room) {
  await updateRoom(room.id, {
    status: "lobby",
    game_state: freshGameState(),
  });
  const supabase = getSupabase();
  await supabase
    .from("participants")
    .update({
      game1_score: null,
      game2_score: null,
      game1_won: false,
      game2_won: false,
    })
    .eq("room_id", room.id);
}
