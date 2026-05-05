/**
 * features/feedback/domain/model — 피드백 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition (외부 의존성 없는 순수 타입)
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - BE 도메인 결정(OKR §2)을 따라 카테고리 3종 / severity 3단계로 union 고정.
 *   - relatedAspects는 자유 텍스트 배열 (예: "tense", "preposition").
 *   - patternId가 존재하면 캐시 히트 패턴(M4) 발생을 의미 — 추후 분석에 활용.
 */

export type FeedbackCategory = "grammar" | "word_choice" | "context";
export type FeedbackSeverity = "high" | "mid" | "low";

export type Feedback = {
  readonly id: string;
  readonly conversationId: string;
  readonly messageId: string;
  readonly category: FeedbackCategory;
  readonly severity: FeedbackSeverity;
  readonly original: string;
  readonly suggestion: string;
  readonly explanation: string;
  readonly relatedAspects: readonly string[];
  readonly patternId: string | null;
  readonly createdAt: string | null;
};
