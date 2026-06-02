import type {
  GameState,
  Participant,
  RoomStatus,
  RouletteKind,
} from "./types";
import { INITIAL_GAME_STATE, PRIZE_PER_GAME } from "./types";

/**
 * 4-자리 영숫자 방 코드. 헷갈리는 0/O, 1/I 같은 글자는 제외.
 */
export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** 1의 자리 추출 */
export function onesDigit(score: number): number {
  return Math.abs(score) % 10;
}

/** 게임 점수로 정렬된 등수 맵을 만든다 (높은 점수 = 1등). 동점자는 같은 등수. */
export function rankParticipants(
  participants: Participant[],
  game: 1 | 2,
): Map<string, number> {
  const scoreOf = (p: Participant) =>
    game === 1 ? p.game1_score : p.game2_score;
  const scored = participants.filter((p) => scoreOf(p) != null);
  scored.sort((a, b) => (scoreOf(b)! ?? -1) - (scoreOf(a)! ?? -1));

  const rankMap = new Map<string, number>();
  let lastScore: number | null = null;
  let lastRank = 0;
  scored.forEach((p, i) => {
    const s = scoreOf(p)!;
    if (s !== lastScore) {
      lastRank = i + 1;
      lastScore = s;
    }
    rankMap.set(p.id, lastRank);
  });
  return rankMap;
}

/** 등수 → 참가자 id 배열 */
export function groupByRank(
  participants: Participant[],
  game: 1 | 2,
): Map<number, string[]> {
  const ranks = rankParticipants(participants, game);
  const map = new Map<number, string[]>();
  for (const [id, rank] of ranks.entries()) {
    if (!map.has(rank)) map.set(rank, []);
    map.get(rank)!.push(id);
  }
  return map;
}

/** 1게임: 룰렛 결과(0~9)와 매칭되는 참가자 id 들을 찾는다. 이미 당첨된 사람은 제외. */
export function findOnesDigitMatch(
  participants: Participant[],
  digit: number,
  alreadyWon: string[],
): string[] {
  const wonSet = new Set(alreadyWon);
  return participants
    .filter(
      (p) =>
        !wonSet.has(p.id) &&
        p.game1_score != null &&
        onesDigit(p.game1_score) === digit,
    )
    .map((p) => p.id);
}

/** 다음 룰렛 결과 추첨 (균등 랜덤) */
export function rollRoulette(kind: RouletteKind, max: number): number {
  if (kind === "ones") return Math.floor(Math.random() * 10);
  // rank: 1 ~ max 사이
  if (max < 1) return 1;
  return Math.floor(Math.random() * max) + 1;
}

/** 빈 게임 상태 새로 만들기 */
export function freshGameState(): GameState {
  return JSON.parse(JSON.stringify(INITIAL_GAME_STATE)) as GameState;
}

/** status 표시용 한글 라벨 */
export function statusLabel(status: RoomStatus): string {
  switch (status) {
    case "lobby":
      return "참가자 모집 중";
    case "game1_input":
      return "1게임 점수 입력 중";
    case "game1_roulette":
      return "1게임 잭팟 룰렛";
    case "game1_rps":
      return "1게임 가위바위보";
    case "game1_done":
      return "1게임 종료 - 2게임 대기 중";
    case "game2_input":
      return "2게임 점수 입력 중";
    case "game2_ranking":
      return "2게임 등수 공개";
    case "game2_roulette":
      return "2게임 잭팟 룰렛";
    case "game2_rps":
      return "2게임 가위바위보 (동점)";
    case "finished":
      return "모든 게임 종료 🎉";
    default:
      return status;
  }
}

export { PRIZE_PER_GAME };
