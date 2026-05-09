/**
 * features/daily-summary/ui/DailySummaryItemCard — 하루 학습 항목 카드 (1 row).
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/daily-summary/domain, features/saved/domain,
 *     features/saved/ui
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - kind별 (feedback / vocabulary) 다른 카드 스타일.
 *   - SavedToggleButton은 outer plug-in (page가 saved hook 콜백 주입).
 */

import type { SavedItem } from "@/features/saved/domain/model";
import { SavedToggleButton } from "@/features/saved/ui/SavedToggleButton";
import type {
  DailySummaryItem,
  FeedbackPayload,
  VocabularyPayload,
} from "@/features/daily-summary/domain/model";

type Props = {
  item: DailySummaryItem;
  saved: SavedItem | undefined;
  onSave: (
    type: "vocabulary" | "feedback",
    referenceId: string
  ) => void;
  onMarkMastered: (id: string) => void;
  onMarkActive: (id: string) => void;
};

const CATEGORY_STYLE: Record<string, string> = {
  grammar: "border-red-300 bg-red-50",
  word_choice: "border-amber-300 bg-amber-50",
  context: "border-blue-300 bg-blue-50",
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function DailySummaryItemCard({
  item,
  saved,
  onSave,
  onMarkMastered,
  onMarkActive,
}: Props) {
  if (item.kind === "vocabulary") {
    const p = item.payload as VocabularyPayload;
    return (
      <article className="rounded border border-gray-200 bg-white p-2 text-xs">
        <header className="mb-1 flex items-center gap-2 text-[10px] uppercase opacity-60">
          <span className="font-mono">vocab</span>
          <span>{formatTime(item.occurredAt)}</span>
          {item.projectName && (
            <span className="opacity-60">· {item.projectName}</span>
          )}
        </header>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono">
            <span className="opacity-70">{p.korean}</span>{" "}
            <span className="opacity-40">→</span>{" "}
            <strong>{p.english}</strong>
          </span>
          <SavedToggleButton
            type="vocabulary"
            referenceId={item.eventId}
            saved={saved}
            onSave={onSave}
            onMarkMastered={onMarkMastered}
            onMarkActive={onMarkActive}
          />
        </div>
      </article>
    );
  }

  // feedback
  const p = item.payload as FeedbackPayload;
  const style = CATEGORY_STYLE[p.category] ?? "border-gray-200 bg-white";
  return (
    <article className={`rounded border ${style} p-2 text-xs`}>
      <header className="mb-1 flex items-center gap-2 text-[10px] uppercase opacity-60">
        <span className="font-mono">{p.category}</span>
        <span>{formatTime(item.occurredAt)}</span>
        {item.projectName && (
          <span className="opacity-60">· {item.projectName}</span>
        )}
      </header>
      <div className="text-sm">
        <s className="opacity-60">{p.original}</s>{" "}
        <span className="opacity-60">→</span>{" "}
        <strong>{p.suggestion}</strong>
      </div>
      {p.explanation && (
        <div className="mt-1 text-[11px] opacity-75">{p.explanation}</div>
      )}
      <div className="mt-1 flex justify-end">
        <SavedToggleButton
          type="feedback"
          referenceId={item.eventId}
          saved={saved}
          onSave={onSave}
          onMarkMastered={onMarkMastered}
          onMarkActive={onMarkActive}
        />
      </div>
    </article>
  );
}
