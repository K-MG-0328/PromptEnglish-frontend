# PromptEnglish Frontend

> AI 영어 학습 플랫폼의 프론트엔드. **Next.js 16 App Router + 4-layer 도메인 구조**를 적용해 보는 학습 프로젝트.

`Next.js 16` · `React 19` · `TypeScript 5 strict` · `Tailwind CSS 4` · `Jotai` · `App Router` · `standalone Docker`

---

## 이게 뭔가요

[PromptEnglish-backend](https://github.com/K-MG-0328/PromptEnglish-backend)와 짝을 이루는 SPA. 좌측(대화 목록) / 중앙(메인 대화) / 우측(피드백 + 단어) **3분할 레이아웃 + drawer/modal**로 회고/follow-up 제공. 단일 사용자 MVP, M6까지 **8 features 완료**.

---

## 왜 이렇게 설계했나

이 프로젝트의 부가 목적은 BE의 헥사고날 + DDD 원칙을 FE에서 어떻게 적용할 수 있는지 끝까지 밀어보는 것. 결정 4개의 근거.

### 1. 4-layer 도메인 구조 (BE 헥사고날의 FE 변형)
**`features/<name>/{domain,application,infrastructure,ui}` 패턴.**

- UI 컴포넌트는 props/events만 받는 Dumb Component (비즈니스 로직 금지)
- Application Layer (Hooks + atoms)에 UseCase orchestration 격리
- API 호출은 Infrastructure Layer에만, 응답을 Domain 타입으로 매핑
- 의존성 위반 방지를 위해 모든 신규 파일에 4-layer JSDoc 헤더 (학습 주석 컨벤션)

### 2. Jotai (전역 상태)
**Provider 분리로 feature 간 상태 격리, atom 단위 정밀 구독.**

- Redux보다 가벼움. useState로 끌고 가기엔 cross-component 통신이 잦음
- 각 feature가 자기 atoms.ts를 소유 (`features/<name>/application/atoms.ts`)
- AppLayout에서 단일 Provider mount

### 3. Tailwind 4 + 디자인 시스템 X (의도적 미루기)
**MVP 단계는 utility-first 그대로, 컴포넌트 추출은 M7 사용감 데이터 보고 결정.**

- 너무 빨리 "Button" 컴포넌트 만들면 변형이 쌓일 때마다 props 폭발
- 사용감 누적 후 "이 패턴이 5번 나왔으니 컴포넌트로 빼자" 시점에 추출

### 4. Next.js 16 standalone Docker
**`output: "standalone"`으로 슬림 이미지.**

- `.next/standalone` + `.next/static` + public만 복사 → ~150MB
- multistage (deps + builder + runner) 분리로 캐시 활용

---

## 아키텍처 (4-layer)

```
features/<feature>/
 ├ domain/          # 순수 타입 (model.ts) — 외부 의존 X
 ├ application/     # Jotai atoms + use*() Hook (UseCase orchestration)
 ├ infrastructure/  # API adapter (httpClient → BE)
 └ ui/              # Dumb Components (props/events만)

ui/
 ├ layout/ThreeAreaLayout.tsx   # 좌(대화목록) / 중(메인대화) / 우(피드백+단어)
 └ AppLayout.tsx                # Jotai Provider mount

infrastructure/
 ├ http/httpClient.ts           # 전역 fetch (credentials: "include", BaseResponse, HttpError 정규화)
 └ config/env.ts                # NEXT_PUBLIC_* 검증

app/
 ├ chat/page.tsx                # 7 hook 합성 + drawer + modal mount
 └ debug/page.tsx               # M5 진입 전 매뉴얼 검증 도구
```

**의존성 방향**:

```
UI → Application → Domain
Infrastructure → Domain
```

절대 금지: `Domain → Application/UI`, `Application → UI`. 자세한 규칙은 [`CLAUDE.md`](./CLAUDE.md).

---

## 8 features (M6 시점)

| Feature | 역할 | BE Endpoint |
|---|---|---|
| `chat` | 메인 대화 (송신/조회/전환) | `/conversations`, `/conversations/{id}/messages` |
| `conversation-list` | 좌측 대화 목록 | `/conversations` |
| `feedback` | 피드백 카드 (3 카테고리/3 severity) + "💬 질문하기" 버튼 | `/feedback` |
| `feedback-query` | 질문하기 Modal (FeedbackQuerySession) | `/feedback/{id}/query-sessions`, `/query-sessions/*` |
| `vocabulary` | 우측 단어 패널 (least-exposed 정렬) | `/vocabulary` |
| `saved` | 저장 토글 (active ↔ mastered) + B-2 우선 정렬 통합 | `/saved-items` |
| `daily-summary` | "📅 오늘 학습" Drawer (4 필터 + 시간순) | `/daily-summary` |
| `learning-info` | 피드백 0건일 때 우측 fallback (LLM 추천 단어) | `/learning-info` |

---

## Quick start

### 사전 요구사항
- **Node 22+** (Next 16 요구)
- **BE가 `:8003`에서 실행 중** (먼저 [backend Quick start](https://github.com/K-MG-0328/PromptEnglish-backend#quick-start) 진행)

### 1) 환경 변수
```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL 확인 (기본: http://localhost:8003/api/v1)
```

### 2) 개발 서버
```bash
npm install
npm run dev   # http://localhost:3003
```

브라우저에서 [http://localhost:3003/chat](http://localhost:3003/chat) → 메시지 송신 → 우측 패널 동작 확인.

### 3) 빌드 / 검증
```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run build       # next build (standalone output for Docker)
```

### 4) Docker
```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8003/api/v1 \
             -t promptenglish-frontend .
docker run -p 3003:3003 promptenglish-frontend
```

**주의**: `NEXT_PUBLIC_*`는 빌드 타임 인라인 — 호스팅 환경별로 별 build args 필요.

---

## 진행 상황

전체 마일스톤 상태는 [backend의 PROGRESS.md](https://github.com/K-MG-0328/PromptEnglish-backend/blob/main/docs/PROGRESS.md) (모노레포 단일 진실 소스).

FE 관점 요약:
- **M5 (11~13주)** — chat + feedback + vocabulary + conversation-list + ThreeAreaLayout 풀스택, 5분 스모크 OK
- **M6 (14~16주)** — saved + daily-summary + feedback-query + learning-info 4 features 추가, drawer/modal mount, standalone Docker
- **M7 (17~20주)** — 4주 매일 사용 + 데이터 축적 (대기)

---

## 라이선스 / 기여

학습 프로젝트로 외부 코드 기여는 받지 않습니다. 이슈/질문은 환영. 코드 라이선스 별도 명시 없음 (기본 "all rights reserved" — 학습 목적 열람 자유).
