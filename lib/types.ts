export type RoomStatus =
  | "lobby"
  | "game1_input"
  | "game1_roulette"
  | "game1_rps"
  | "game1_done"
  | "game2_input"
  | "game2_ranking"
  | "game2_roulette"
  | "game2_rps"
  | "finished";

export type RouletteKind = "ones" | "rank";

export interface RouletteState {
  spinning: boolean;
  result: number | null;
  kind: RouletteKind;
  /** 매 회 새 룰렛을 그릴 때 강제 리렌더 트리거 */
  spinId?: number;
}

export interface Game1State {
  /** 1게임 최종 당첨자(확정) participant id 들 */
  winners: string[];
  /** 가장 최근 룰렛에서 매칭됐지만 아직 확정/탈락 결정 안 된 후보 */
  candidates: string[];
  /** 가위바위보 진행 정보 */
  rps: RpsState | null;
  /** 룰렛을 몇 번 돌렸는지 */
  round: number;
}

export interface Game2State {
  /** 2게임 최종 당첨자(확정) participant id 들 - 뽑힌 순서대로 */
  winners: string[];
  /** 가장 최근 룰렛 결과로 표시 중인 등수 정보 */
  current: {
    rank: number;
    /** 해당 등수에 속한 participant ids */
    ids: string[];
  } | null;
  /** 동점자 RPS */
  rps: RpsState | null;
  /** 룰렛 회차 (1~4) */
  spin_count: number;
}

export interface RpsState {
  /** 후보 참가자 id 들 */
  candidates: string[];
  /** 운영자가 고른 승자 id 들 (배열 길이가 목표 인원에 도달하면 종료) */
  picked_winners: string[];
  /** 이번 RPS 로 최종적으로 몇 명을 뽑아야 하는지 */
  need: number;
  /** 어떤 단계에서 호출되었는지 표시 (UI 용) */
  reason: "overflow" | "tie";
}

export interface GameState {
  phase: RoomStatus;
  roulette: RouletteState;
  game1: Game1State;
  game2: Game2State;
}

export interface Room {
  id: string;
  code: string;
  admin_token: string;
  status: RoomStatus;
  game_state: GameState;
  created_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  name: string;
  game1_score: number | null;
  game2_score: number | null;
  game1_won: boolean;
  game2_won: boolean;
  created_at: string;
}

export const PRIZE_PER_GAME = 4;

export const INITIAL_GAME_STATE: GameState = {
  phase: "lobby",
  roulette: { spinning: false, result: null, kind: "ones", spinId: 0 },
  game1: { winners: [], candidates: [], rps: null, round: 0 },
  game2: { winners: [], current: null, rps: null, spin_count: 0 },
};
