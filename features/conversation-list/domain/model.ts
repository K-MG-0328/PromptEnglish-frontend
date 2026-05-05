/**
 * features/conversation-list/domain/model — 대화 목록 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - GET /conversations의 ConversationSummaryResponse 매핑.
 *     messages는 미포함 (목록은 가벼움 유지).
 */

export type ConversationSummary = {
  readonly id: string;
  readonly projectName: string;
  readonly projectSummary: string | null;
  readonly createdAt: string;
  readonly lastMessageAt: string | null;
};
