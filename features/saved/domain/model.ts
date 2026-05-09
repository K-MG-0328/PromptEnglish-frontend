/**
 * features/saved/domain/model — 저장 항목 도메인 타입.
 *
 * 4-layer: Domain
 * 역할: Type Definition
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - BE OKR §3.5 / §4 — 단일 SavedItem 테이블 + type 필드.
 *   - status는 active(학습 중) ↔ mastered(외움) 두 상태만. 삭제 없음.
 */

export type SavedItemType = "vocabulary" | "feedback";
export type SavedItemStatus = "active" | "mastered";

export type SavedItem = {
  readonly id: string;
  readonly type: SavedItemType;
  readonly referenceId: string;
  readonly status: SavedItemStatus;
  readonly savedAt: string;
  readonly lastStatusChangeAt: string;
};
