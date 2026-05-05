/**
 * features/vocabulary/domain/model — 단어 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - BE OKR §3 (모르는 단어 자동 추출). exposure_count는 사이드 패널 노출 누적.
 */

export type VocabularyEntry = {
  readonly id: string;
  readonly korean: string;
  readonly english: string;
  readonly exposureCount: number;
  readonly createdAt: string;
  readonly lastExposedAt: string | null;
  readonly sourceConversationId: string | null;
};
