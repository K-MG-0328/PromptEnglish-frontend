/**
 * features/vocabulary/ui/VocabularyList — 단어 항목 리스트.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/vocabulary/domain
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - 한국어 → 영어 매핑 한 줄. exposure_count 작게 표시 (덜 노출된 순 정렬).
 *   - onExpose가 주어지면 항목 hover 시 노출 카운트 증가 (사이드 노출 = 학습 도움).
 */

import type { VocabularyEntry } from "@/features/vocabulary/domain/model";

type Props = {
  entries: readonly VocabularyEntry[];
  onExpose?: (entryId: string) => void;
};

export function VocabularyList({ entries, onExpose }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-xs opacity-50">아직 추출된 단어가 없습니다.</div>
    );
  }
  return (
    <ul className="space-y-1.5 text-xs">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-baseline justify-between gap-2 rounded bg-white px-2 py-1.5"
          onMouseEnter={() => onExpose?.(entry.id)}
        >
          <span className="flex-1 font-mono">
            <span className="opacity-70">{entry.korean}</span>{" "}
            <span className="opacity-40">→</span>{" "}
            <span className="font-semibold">{entry.english}</span>
          </span>
          <span className="text-[10px] opacity-50">{entry.exposureCount}회</span>
        </li>
      ))}
    </ul>
  );
}
