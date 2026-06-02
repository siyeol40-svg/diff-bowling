-- =====================================================================
-- 디프냥 볼링 잭팟 - Supabase 스키마
-- Supabase 콘솔의 SQL Editor에 통째로 붙여넣고 실행하세요.
-- =====================================================================

-- 안전: 같은 이름 반복 실행을 위해 IF NOT EXISTS / DROP 처리는 최소화.
-- 처음 한 번만 실행하면 됩니다.

-- 1) 방
create table if not exists public.rooms (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  admin_token     uuid not null default gen_random_uuid(),
  status          text not null default 'lobby',
  -- status 값:
  --   lobby                 : 방 생성 직후, 참가자 모집 중
  --   game1_input           : 1게임 점수 입력 중
  --   game1_roulette        : 1게임 룰렛 진행 (0~9 슬롯)
  --   game1_rps             : 1게임 가위바위보
  --   game1_done            : 1게임 시상 완료
  --   game2_input           : 2게임 점수 입력 중
  --   game2_ranking         : 2게임 등수 공개
  --   game2_roulette        : 2게임 룰렛 진행 (1~N 슬롯)
  --   game2_rps             : 2게임 동점 가위바위보
  --   finished              : 전체 종료
  game_state      jsonb not null default '{
    "phase": "lobby",
    "roulette": { "spinning": false, "result": null, "kind": "ones" },
    "game1": { "winners": [], "candidates": [], "rps": null, "round": 0 },
    "game2": { "winners": [], "current": null, "rps": null, "spin_count": 0 }
  }'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists rooms_code_idx on public.rooms (code);

-- 2) 참가자
create table if not exists public.participants (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references public.rooms(id) on delete cascade,
  name            text not null,
  game1_score     int,
  game2_score     int,
  game1_won       boolean not null default false,
  game2_won       boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists participants_room_idx on public.participants (room_id);

-- 3) Row Level Security
alter table public.rooms enable row level security;
alter table public.participants enable row level security;

-- 누구나 방/참가자를 읽을 수 있어야 합니다. (참가자들이 실시간으로 봐야 하기 때문)
drop policy if exists rooms_select_all on public.rooms;
create policy rooms_select_all on public.rooms
  for select using (true);

drop policy if exists participants_select_all on public.participants;
create policy participants_select_all on public.participants
  for select using (true);

-- 쓰기는 모두 허용합니다 (anon 키 사용).
-- 운영자 보호는 admin_token 매칭으로 애플리케이션 레벨에서 처리합니다.
-- 행사 한 번 쓰고 버릴 가벼운 앱이므로 이 정도면 충분합니다.
drop policy if exists rooms_insert_all on public.rooms;
create policy rooms_insert_all on public.rooms
  for insert with check (true);

drop policy if exists rooms_update_all on public.rooms;
create policy rooms_update_all on public.rooms
  for update using (true) with check (true);

drop policy if exists participants_insert_all on public.participants;
create policy participants_insert_all on public.participants
  for insert with check (true);

drop policy if exists participants_update_all on public.participants;
create policy participants_update_all on public.participants
  for update using (true) with check (true);

drop policy if exists participants_delete_all on public.participants;
create policy participants_delete_all on public.participants
  for delete using (true);

-- 4) Realtime 구독을 위해 publication 에 테이블 추가
-- (Supabase 대시보드: Database → Replication → supabase_realtime publication 에서
--  rooms / participants 토글을 ON 으로 바꾸셔도 됩니다.)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    execute 'alter publication supabase_realtime add table public.rooms';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'participants'
  ) then
    execute 'alter publication supabase_realtime add table public.participants';
  end if;
end $$;
