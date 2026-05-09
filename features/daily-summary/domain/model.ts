/**
 * features/daily-summary/domain/model — 하루 학습 정리 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - BE에서 feedbacks + vocabulary_entries를 UNION ALL로 합쳐 시간순 반환.
 *   - kind별 payload 구조가 다르므로 type narrowing 위해 union 분리.
 *   - savedStatus는 LEFT JOIN saved_items 결과 (null이면 미저장).
 */

export type DailySummaryItemKind = "feedback" | "vocabulary";

export type FeedbackPayload = {
  readonly severity: string;
  readonly original: string;
  readonly suggestion: string;
  readonly explanation: string;
  readonly relatedAspects: readonly string[];
  readonly category: string;
  readonly messageId: string;
};

export type VocabularyPayload = {
  readonly korean: string;
  readonly english: string;
  readonly exposureCount: number;
};

export type DailySummaryItem = {
  readonly kind: DailySummaryItemKind;
  readonly occurredAt: string;
  readonly conversationId: string | null;
  readonly projectName: string | null;
  readonly eventId: string;
  readonly savedStatus: "active" | "mastered" | null;
  readonly payload: FeedbackPayload | VocabularyPayload | Record<string, unknown>;
};

export type DailySummary = {
  readonly date: string; // YYYY-MM-DD
  readonly items: readonly DailySummaryItem[];
};

export type DailySummaryFilter = {
  readonly category: "grammar" | "word_choice" | "context" | null;
  readonly conversationId: string | null;
  readonly saved: boolean | null;
};
