# CLAUDE.md

## Commands

```bash
npm run dev      # Next.js dev server
npm run build    # Production build
npm run lint     # ESLint
npm run typecheck
```

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- Tailwind CSS 4, Jotai, ESLint 9

## Path Alias

`@/*` → project root. 예: `@/features/...`, `@/ui/...`, `@/app/...`

## 프로젝트 구조

```
features/<feature>/
  domain/          model, state, intent (순수 타입)
  application/     atoms, selectors, hooks
  infrastructure/  api (외부 통신)
  ui/              components (Dumb Components만)

ui/                공통 컴포넌트
infrastructure/    httpClient, env config
app/               Next.js 라우팅 (entry point만)
```

## 레이어 의존성

```
UI → Application → Domain
Infrastructure → Domain
```

절대 금지: `Domain → Application/UI`, `Application → UI`

## 레이어별 MUST 규칙

### Domain
순수 타입/모델만. 외부 의존성(API, storage, 프레임워크) import 금지.

### Application
- 상태: Jotai atoms (`application/atoms`)
- UseCase orchestration: hooks (`application/hooks`)
- 외부 호출은 infrastructure를 통해서만

### Infrastructure
- API 호출은 `infrastructure/api`에서만
- 전역 `httpClient` 사용 (BASE_URL, 쿠키, 공통 에러 처리 내장)

### UI
- 비즈니스 로직 작성 금지, side effect 금지 — Dumb Component
- `app/` 페이지는 Application Hook 호출만 담당

## Working Guidelines

1. Domain Layer에 외부 의존성 추가 금지
2. UI 컴포넌트에 비즈니스 로직 작성 금지
3. 상태 로직은 Application Layer에만 작성
4. API 호출은 Infrastructure Layer에서만 수행
5. 새 기능은 `features/<name>/` 구조로 생성
6. Domain 타입 중심으로 코드 작성
