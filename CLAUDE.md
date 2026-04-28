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

---

## 학습 주석 컨벤션 (필수)

본 프로젝트는 헥사고날·4-layer 학습이 부가 목적. **모든 새 모듈은 파일 상단에 학습용 JSDoc 주석을 남긴다.**

### 1) 파일 헤더

```typescript
/**
 * <한 줄 설명>
 *
 * 4-layer: <Domain | Application | Infrastructure | UI>
 * 역할: <Type Definition | State (atom) | UseCase Hook | API Adapter | Component>
 * 의존성 방향:
 *   - import 가능: <상위 레이어>
 *   - import 금지: <하위/사이드 레이어>
 * 기술 선택:
 *   - <왜 Jotai atom인지, 왜 httpClient를 쓰는지 등>
 */
```

**예 (Application — UseCase Hook)**
```typescript
/**
 * useChatUseCase — 채팅 입력/응답 흐름을 조립하는 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook (Domain 모델을 조립, Infrastructure를 호출)
 * 의존성 방향:
 *   - import 가능: features/chat/domain, features/chat/infrastructure/api,
 *     features/chat/application/atoms, jotai
 *   - import 금지: UI 컴포넌트, 다른 feature의 application/ui
 * 기술 선택:
 *   - Jotai atom — Provider 분리로 feature 간 상태 격리
 *   - httpClient (전역) — credentials/base URL/에러 정규화 일원화
 */
```

**예 (Infrastructure — API Adapter)**
```typescript
/**
 * weaknessApi — 약점 목록 조회 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter (백엔드 REST 호출 → Domain 타입으로 매핑)
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/weakness/domain
 *   - import 금지: UI, features/weakness/application
 * 기술 선택:
 *   - 응답을 Domain 타입으로 매핑하는 책임을 여기서 가짐.
 *     UseCase는 백엔드 응답 형태를 알지 못해야 백엔드 API 변화에
 *     UseCase가 흔들리지 않음.
 */
```

### 2) 컴포넌트는 Dumb 보장

UI 컴포넌트는 props/events만 받음. 비즈니스 로직 주석이 필요한 시점이 오면 **Application Layer로 옮겨야 한다는 신호**.

### 3) Retrofitting

기존 `infrastructure/`, `ui/layout/AppLayout.tsx`는 2주차 도메인 모델링 시점에 위 컨벤션으로 한 번에 retrofitting (OKR KR 4.5).

### 4) 학습 주석이 *아닌* 것

- prop 타입 설명 (TypeScript 타입으로 충분)
- 컴포넌트 한 줄 설명 — 이름이 명확하면 생략
- 변경 이력, 작성자 — git이 담당
