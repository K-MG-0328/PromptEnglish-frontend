/**
 * features/feedback-query/domain/model — 피드백 질문 세션 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - 메인 대화와 완전 독립된 별 세션. qa_sequence는 시간순 Q/A pair.
 *   - is_closed=true 면 더 질문 추가 불가. BE에서 24h 무활동 시 자동 close.
 */

export type QAEntry = {
  readonly question: string;
  readonly answer: string;
  readonly askedAt: string;
};

export type FeedbackQuerySession = {
  readonly id: string;
  readonly feedbackId: string;
  readonly qaSequence: readonly QAEntry[];
  readonly startedAt: string | null;
  readonly lastActivityAt: string | null;
  readonly isClosed: boolean;
};
