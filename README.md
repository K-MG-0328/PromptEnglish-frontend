# PromptEnglish Frontend

Next.js 16 (App Router) + Jotai + Tailwind 4. LLM 기반 영어학습 플랫폼의 프론트엔드.

## Setup

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL 확인 (backend uvicorn 포트와 일치해야 함)

npm install
npm run dev
```

확인: 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기 → backend `/api/v1/health` 핑 결과가 표시되어야 함.

## Project Structure

```
app/                       Next.js App Router 진입점 (page.tsx만, layout 최소)
features/<feature>/        도메인별 4-layer 구성
  domain/                  순수 타입 (model, state, intent)
  application/             Jotai atoms, hooks
  infrastructure/          API 호출
  ui/                      Dumb Components
ui/                        공통 컴포넌트 (Navbar 등)
infrastructure/
  http/httpClient.ts       전역 fetch 래퍼 (credentials: include)
  config/env.ts            env 검증 + apiBaseUrl 접근자
```

레이어 규칙은 `CLAUDE.md` 참조.
프로젝트 OKR은 [`PromptEnglish-backend/docs/OKR.md`](../PromptEnglish-backend/docs/OKR.md) 참조.
