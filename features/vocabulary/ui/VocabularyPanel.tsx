/**
 * features/vocabulary/ui/VocabularyPanel — 학습 정보 (단어) 패널.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/vocabulary/domain, features/vocabulary/ui/VocabularyList
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - 피드백이 없을 때 사이드 패널의 fallback (PROJECT_IDEAS §3 LearningInfo 2순위).
 *   - refresh 버튼은 새 단어가 추출됐을 때 즉시 반영.
 */

import type { VocabularyEntry } from "@/features/vocabulary/domain/model";
import { VocabularyList } from "./VocabularyList";

type Props = {
  entries: readonly VocabularyEntry[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onExpose?: (entryId: string) => void;
};

export function VocabularyPanel({
  entries,
  loading,
  error,
  onRefresh,
  onExpose,
}: Props) {
  return (
    <section className="flex h-full flex-col gap-2 p-4">
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">학습 단어</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="text-[10px] underline disabled:opacity-30"
        >
          {loading ? "..." : "새로고침"}
        </button>
      </header>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-900">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <VocabularyList entries={entries} onExpose={onExpose} />
      </div>
    </section>
  );
}
