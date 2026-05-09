/**
 * features/daily-summary/ui/DailySummaryDrawer — 하루 학습 정리 drawer.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/daily-summary/domain, features/daily-summary/ui,
 *     features/saved/domain, features/saved/ui
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - 화면 우측에서 슬라이드 인. width 28~32rem.
 *   - 외부 클릭 / ESC로 닫힘.
 *   - SavedToggleButton 콜백을 그대로 위임.
 */

import { useEffect } from "react";

import type { SavedItem } from "@/features/saved/domain/model";
import type {
  DailySummary,
  DailySummaryFilter,
} from "@/features/daily-summary/domain/model";
import { DailySummaryFilterBar } from "./DailySummaryFilterBar";
import { DailySummaryItemCard } from "./DailySummaryItemCard";

type Props = {
  open: boolean;
  date: string;
  filter: DailySummaryFilter;
  summary: DailySummary | null;
  loading: boolean;
  error: string | null;
  activeConversationId: string | null;
  getSaved: (
    type: "vocabulary" | "feedback",
    referenceId: string
  ) => SavedItem | undefined;
  onSave: (type: "vocabulary" | "feedback", referenceId: string) => void;
  onMarkMastered: (id: string) => void;
  onMarkActive: (id: string) => void;
  onDateChange: (date: string) => void;
  onFilterChange: (filter: DailySummaryFilter) => void;
  onClose: () => void;
};

export function DailySummaryDrawer({
  open,
  date,
  filter,
  summary,
  loading,
  error,
  activeConversationId,
  getSaved,
  onSave,
  onMarkMastered,
  onMarkActive,
  onDateChange,
  onFilterChange,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <aside
        className="flex h-full w-[30rem] max-w-full flex-col border-l border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="text-sm font-semibold">📅 오늘 학습</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs opacity-60 hover:opacity-100"
          >
            닫기 (ESC)
          </button>
        </header>

        <DailySummaryFilterBar
          date={date}
          filter={filter}
          activeConversationId={activeConversationId}
          onDateChange={onDateChange}
          onFilterChange={onFilterChange}
        />

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-900">
              {error}
            </div>
          )}
          {loading && !summary && (
            <div className="text-center text-xs opacity-50">불러오는 중...</div>
          )}
          {summary && summary.items.length === 0 && (
            <div className="text-center text-xs opacity-50">
              해당 조건의 학습 기록이 없습니다.
            </div>
          )}
          {summary?.items.map((item) => (
            <DailySummaryItemCard
              key={`${item.kind}-${item.eventId}`}
              item={item}
              saved={getSaved(
                item.kind === "vocabulary" ? "vocabulary" : "feedback",
                item.eventId
              )}
              onSave={onSave}
              onMarkMastered={onMarkMastered}
              onMarkActive={onMarkActive}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}
