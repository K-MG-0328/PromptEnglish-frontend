/**
 * features/learning-info/domain/model — 학습 정보 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - 피드백이 없을 때 우측 패널의 fallback (BE doc/40-saved-and-summary.md §3).
 *   - source 별 의미: SUGGESTED(LLM 추천) / UNKNOWN_FROM_DB / EMPTY.
 */

export type LearningInfoSource = "suggested" | "unknown_from_db" | "empty";

export type LearningInfoItem = {
  readonly korean: string;
  readonly english: string;
  readonly explanation: string | null;
};

export type LearningInfo = {
  readonly source: LearningInfoSource;
  readonly items: readonly LearningInfoItem[];
};
