# PromptEnglish Frontend

Next.js 16 (App Router) + React 19 + Jotai + Tailwind CSS 4. LLM 기반 영어학습 플랫폼 프론트엔드.

## Setup

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL 확인 — backend uvicorn 포트와 일치해야 함 (기본 8003)

npm install
npm run dev  # http://localhost:3003
```

확인: 브라우저에서 [http://localhost:3003/chat](http://localhost:3003/chat) → 메시지 송신 → 우측 패널 동작.

## Architecture (4-layer)

```
features/<feature>/
  domain/          # 순수 타입 (model.ts) — 외부 의존 X
  application/     # Jotai atoms + use*() Hook (UseCase orchestration)
  infrastructure/  # API 어댑터 (httpClient → BE)
  ui/              # Dumb Components (props/events만)

ui/
  layout/          # ThreeAreaLayout (좌:대화목록 / 중:메인대화 / 우:피드백+단어)
  AppLayout.tsx    # Jotai Provider

infrastructure/
  http/httpClient.ts  # 전역 fetch (credentials: "include", BaseResponse, HttpError)
  config/env.ts       # NEXT_PUBLIC_* 검증

app/
  chat/page.tsx       # 7 hook 합성 + drawer + modal mount
  debug/page.tsx      # M5 진입 전 매뉴얼 검증 도구 (보존)
```

레이어 의존성: `UI → Application → Domain` / `Infrastructure → Domain`. 절대 금지: `Domain → Application/UI`, `Application → UI`. 자세한 규칙은 [`CLAUDE.md`](./CLAUDE.md).

## 현재 features (M6 시점)

| Feature | 역할 |
|---|---|
| `chat` | 메인 대화 (송신/조회/전환) |
| `conversation-list` | 좌측 대화 목록 |
| `feedback` | 피드백 카드 (3 카테고리/3 severity) + 질문하기 버튼 |
| `feedback-query` | "💬 질문하기" Modal (FeedbackQuerySession) |
| `vocabulary` | 우측 단어 패널 (least-exposed 정렬) |
| `saved` | 저장 토글 (active ↔ mastered) + B-2 우선 정렬 통합 |
| `daily-summary` | "📅 오늘 학습" Drawer (4 필터 + 시간순) |
| `learning-info` | 피드백 0건일 때 우측 fallback (LLM 추천 단어) |

## 빌드

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # next build (standalone output for Docker)
```

`next.config.ts`에 `output: "standalone"` 설정 — Docker 멀티스테이지 빌드 시 `.next/standalone`만 복사해 슬림 이미지.

## Docker

```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8003/api/v1 \
             -t promptenglish-frontend .
docker run -p 3003:3003 promptenglish-frontend
```

`NEXT_PUBLIC_*`는 빌드 타임 인라인. 호스팅 환경별로 별 build args 필요.

## 진실 소스

프로젝트 OKR/도메인은 [`../PromptEnglish-backend/docs/`](../PromptEnglish-backend/docs/) 참조 (모노레포 단일 소스).
