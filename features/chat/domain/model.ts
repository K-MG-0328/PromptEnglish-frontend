/**
 * features/chat/domain/model — 채팅 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition (외부 의존성 없는 순수 타입)
 * 의존성 방향:
 *   - import 가능: 없음 (TypeScript 표준만)
 *   - import 금지: infrastructure, application, ui, fetch, atom, react
 * 기술 선택:
 *   - BE의 sentence_pair / reply / message 구조를 거울처럼 옮김 (snake_case → camelCase 매핑은 infrastructure에서)
 *   - readonly + 리터럴 union으로 도메인 불변식을 타입 시스템에 박는다
 */

export type HighlightReason = "vocab_gap" | "feedback";

export type HighlightedWord = {
  readonly text: string;
  readonly reason: HighlightReason;
};

export type SentencePair = {
  readonly english: string;
  readonly korean: string;
  readonly highlightedWords: readonly HighlightedWord[];
};

export type Reply = {
  readonly sentencePairs: readonly SentencePair[];
  readonly generatedAt: string;
};

export type UserMessage = {
  readonly id: string;
  readonly content: string;
  readonly createdAt: string;
};

/**
 * 한 user message + (옵셔널) assistant reply 한 쌍. UI 렌더 단위.
 */
export type ChatTurn = {
  readonly user: UserMessage;
  readonly reply: Reply | null;
};

export type Conversation = {
  readonly id: string;
  readonly projectName: string;
  readonly turns: readonly ChatTurn[];
};
