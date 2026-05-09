/**
 * features/learning-info/ui/LearningInfoPanel — 학습 정보 fallback 패널.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/learning-info/domain
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - source별 헤더 다르게 표시 (SUGGESTED는 "추천 단어" / DB는 "복습 단어").
 *   - EMPTY는 안내 문구만.
 */

import type { LearningInfo } from "@/features/learning-info/domain/model";

type Props = {
  info: LearningInfo | null;
  loading: boolean;
};

const SOURCE_LABEL: Record<LearningInfo["source"], string> = {
  suggested: "주제 관련 추천 단어",
  unknown_from_db: "복습 추천 단어",
  empty: "",
};

export function LearningInfoPanel({ info, loading }: Props) {
  if (loading && !info) {
    return (
      <div className="grid h-full place-items-center text-xs opacity-50">
        학습 정보 불러오는 중...
      </div>
    );
  }

  if (!info || info.source === "empty" || info.items.length === 0) {
    return (
      <div className="grid h-full place-items-center text-center text-xs opacity-50">
        피드백이 없을 때 추천 단어가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <header>
        <h3 className="text-xs font-semibold opacity-70">
          {SOURCE_LABEL[info.source]}
        </h3>
      </header>
      <ul className="flex-1 space-y-1.5 overflow-y-auto text-xs">
        {info.items.map((item, i) => (
          <li
            key={`${item.english}-${i}`}
            className="rounded border border-gray-200 bg-white px-2 py-1.5"
          >
            <div className="flex items-baseline justify-between gap-2 font-mono">
              <span className="opacity-70">{item.korean}</span>
              <span className="font-semibold">{item.english}</span>
            </div>
            {item.explanation && (
              <div className="mt-1 text-[10px] opacity-60">
                {item.explanation}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
