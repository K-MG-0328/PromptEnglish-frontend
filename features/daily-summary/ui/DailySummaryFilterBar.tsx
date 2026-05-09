/**
 * features/daily-summary/ui/DailySummaryFilterBar — 하루 학습 필터 바.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/daily-summary/domain
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - 4 필터 (날짜/카테고리/저장 여부/대화) 한 줄 정렬.
 *   - 카테고리는 segmented control 형태.
 *   - 저장 여부는 3 상태 (전체/저장됨/미저장) 토글.
 *   - 대화 필터는 상위 page에서 활성 conversationId만 토글로 (기본은 전체).
 */

import type { DailySummaryFilter } from "@/features/daily-summary/domain/model";

type Props = {
  date: string;
  filter: DailySummaryFilter;
  activeConversationId: string | null; // 현재 /chat 대화 — 토글 옵션으로 노출
  onDateChange: (date: string) => void;
  onFilterChange: (filter: DailySummaryFilter) => void;
};

const CATEGORIES: ReadonlyArray<DailySummaryFilter["category"]> = [
  null,
  "grammar",
  "word_choice",
  "context",
];

const CATEGORY_LABEL: Record<string, string> = {
  null: "전체",
  grammar: "Grammar",
  word_choice: "Word",
  context: "Context",
};

export function DailySummaryFilterBar({
  date,
  filter,
  activeConversationId,
  onDateChange,
  onFilterChange,
}: Props) {
  const setCategory = (category: DailySummaryFilter["category"]) => {
    onFilterChange({ ...filter, category });
  };
  const setSaved = (saved: DailySummaryFilter["saved"]) => {
    onFilterChange({ ...filter, saved });
  };
  const setOnlyThisConv = (only: boolean) => {
    onFilterChange({
      ...filter,
      conversationId: only ? activeConversationId : null,
    });
  };

  return (
    <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-2 text-xs">
      <div className="flex items-center gap-2">
        <label className="opacity-60">날짜</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded border border-gray-300 px-1.5 py-0.5"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <span className="opacity-60">카테고리</span>
        {CATEGORIES.map((c) => (
          <button
            key={String(c)}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded px-2 py-0.5 text-[10px] ${
              filter.category === c
                ? "bg-black text-white"
                : "border border-gray-300 bg-white"
            }`}
          >
            {CATEGORY_LABEL[String(c)]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <span className="opacity-60">저장</span>
        {(
          [
            [null, "전체"],
            [true, "저장됨"],
            [false, "미저장"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setSaved(v)}
            className={`rounded px-2 py-0.5 text-[10px] ${
              filter.saved === v
                ? "bg-black text-white"
                : "border border-gray-300 bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeConversationId && (
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filter.conversationId === activeConversationId}
            onChange={(e) => setOnlyThisConv(e.target.checked)}
          />
          <span className="opacity-60">현재 대화만</span>
        </label>
      )}
    </div>
  );
}
