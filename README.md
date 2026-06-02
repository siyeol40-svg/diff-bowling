# 디프냥의 볼링 잭팟 🎳🍔

디프 부서 조직력 강화 행사용 웹앱. 운영자가 방을 만들어 링크를 뿌리면 참가자들이
실시간으로 룰렛과 시상 과정을 함께 볼 수 있습니다. 배민 5만원권 8장이 걸려 있어요.

## 게임 규칙 요약

### 1게임 — 1의 자리 잭팟
1. 각자 볼링 한 게임씩 치고 점수를 운영자에게 알려줍니다.
2. 운영자가 모든 참가자의 점수를 입력합니다.
3. 0~9 사이의 잭팟 룰렛이 돌아갑니다.
4. **본인 점수의 1의 자리 숫자**가 룰렛 결과와 같으면 당첨!
5. 누적 당첨자가 4명 이하이면 시상 후 한 번 더 굴립니다.
6. 후보까지 합쳐 4명을 초과하면 가위바위보로 결정 (운영자가 승자 선택).

### 2게임 — 등수 잭팟
1. 다시 볼링 한 게임을 치고 점수를 입력합니다.
2. 등수가 먼저 공개됩니다.
3. 1등부터 N등 사이에서 룰렛이 돌아가 한 등수를 뽑습니다.
4. 동점자가 있으면 가위바위보로 결정.
5. 4명이 채워질 때까지 반복합니다.

## 기술 스택
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **Framer Motion**
- **Supabase** (Postgres + Realtime) — 모든 참가자 화면이 실시간으로 동기화됩니다.

## 처음 한 번만 — 셋업

### 1) 의존성 설치
```bash
npm install
```

### 2) Supabase 프로젝트 만들기
1. https://supabase.com 에서 새 프로젝트를 만듭니다.
2. Project Settings → API 에서 두 값을 복사합니다.
   - `Project URL`
   - `anon` `public` 키
3. 프로젝트 루트에 `.env.local` 파일을 만들고 채웁니다.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   (`.env.local.example` 을 그대로 복사하셔도 됩니다.)

### 3) DB 스키마 적용
1. Supabase 대시보드 → SQL Editor 로 이동.
2. `supabase/schema.sql` 의 내용을 통째로 붙여넣고 **Run**.
3. (자동으로 RLS 정책과 Realtime publication 까지 설정됩니다.)

### 4) 디프냥 캐릭터 이미지 배치 ⭐
1. 디프냥 원본 이미지를 저장 → (선택) https://remove.bg 에서 배경 제거.
2. **`public/diffnyang.png`** 경로에 저장.
3. 끝. 코드가 이 경로의 이미지를 자동으로 읽어서 모든 화면에 같은 캐릭터로 표시합니다.
   - 이미지가 없으면 자동으로 귀여운 SVG 폴백이 사용됩니다.
   - 다른 표정/포즈를 추가하고 싶으면 `diffnyang_smile.png` 처럼 같은 폴더에 더 넣고
     `<DiffNyangAvatar />` 의 `src` 를 늘려서 쓰면 됩니다.

### 5) 로컬에서 띄우기
```bash
npm run dev
```
브라우저에서 http://localhost:3000 으로 접속합니다.

## 행사 당일 흐름

1. **운영자**:
   - 노트북에서 `/` 에 접속해 **새 방 만들기** 클릭.
   - 곧바로 운영자 페이지로 이동하고, 화면 상단에 **참가자 입장 링크 + 방 코드** 가 나옵니다.
   - 링크/QR 등으로 참가자에게 공유.
2. **참가자**:
   - 링크에 들어가면 **디프냥의 룰 설명 + 하이퍼프레임** 이 자동으로 표시됩니다.
   - 운영자가 게임을 진행하면 화면이 자동으로 같이 넘어갑니다.
3. **운영자 (1게임)**:
   - 모든 참가자 등록 → **1게임 시작**.
   - 점수 입력 후 **🎰 룰렛으로**.
   - **🎰 룰렛 돌리기** → 결과/매칭자 확인 → **✅ 결과 확정**.
   - 가위바위보가 필요하면 후보 카드 중 승자를 클릭.
4. **운영자 (2게임)**:
   - **🎳 2게임 시작** → 점수 재입력 → **🏁 등수 공개** → **🎰 룰렛 시작**.
   - 룰렛 → 결과 확정 / 동점이면 가위바위보 → 4명까지 반복.
5. **종료**:
   - **🎊 모든 게임 종료!** 화면이 자동으로 뜨고, 1·2게임 당첨자가 함께 나옵니다.

## 운영 팁
- 운영자 페이지는 **방을 만든 브라우저에서만 자동 인증**됩니다.
  다른 기기에서 운영해야 한다면, 방을 만든 브라우저의 개발자 콘솔에서
  ```js
  localStorage.getItem('diff-admin-token-YOUR_CODE')
  ```
  로 토큰을 확인해 새 기기에 입력하면 됩니다.
- 모든 상태는 Supabase 의 `rooms.game_state` 한 row 안에 들어 있어, 새로고침해도 화면이 유지됩니다.
- 행사를 처음부터 다시 하고 싶으면 운영자 화면의 **방 다시 시작** 버튼을 누르세요.
- 단계가 꼬였을 때를 위해 운영자 패널 맨 아래 **⚙️ 단계 강제 이동** 메뉴가 있습니다.

## 배포
- Vercel: 이 폴더를 그대로 Vercel 에 import. 환경변수만 같은 두 개를 등록하면 끝.
- 모바일 브라우저에서도 그대로 잘 동작합니다 (반응형).

## 디렉터리 구조
```
.
├── app/
│   ├── page.tsx                # 홈 (방 만들기 / 입장)
│   ├── r/[code]/page.tsx       # 참가자 화면
│   └── r/[code]/admin/page.tsx # 운영자 화면
├── components/
│   ├── DiffNyangAvatar.tsx
│   ├── DiffNyangChat.tsx       # 동물의 숲 채팅
│   ├── HyperFrame.tsx          # 상단 영상 같은 일러스트
│   ├── JackpotRoulette.tsx     # 슬롯머신 룰렛
│   ├── WinnerCard.tsx
│   ├── Confetti.tsx
│   ├── RulesIntro.tsx          # 디프냥 룰 설명
│   ├── GameStage.tsx           # 상태별 보드 (참가자/운영자 공통)
│   └── AdminPanel.tsx          # 운영자 컨트롤
├── lib/
│   ├── supabase.ts             # supabase-js 클라이언트
│   ├── useRoom.ts              # 실시간 구독 훅
│   ├── types.ts                # GameState / Room / Participant 타입
│   ├── game.ts                 # 게임 유틸 (등수, 매칭 등)
│   └── gameActions.ts          # 운영자 액션 (DB 업데이트)
├── public/
│   └── diffnyang.png           # (사용자가 추가)
├── supabase/schema.sql
├── tailwind.config.ts
├── package.json
└── README.md
```

made with 🧡 for the diff team
