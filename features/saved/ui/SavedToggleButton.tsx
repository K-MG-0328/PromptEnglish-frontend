/**
 * features/saved/ui/SavedToggleButton — 저장/외움 3단계 버튼.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/saved/domain
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - 저장 안 됨 → "+ 저장" 클릭 시 onSave.
 *   - 저장 active → "✓ 저장됨 / 외움 처리" 두 버튼.
 *   - 저장 mastered → "외움 / 다시 학습" 두 버튼.
 *   - 페이지가 saved hook의 콜백을 props로 주입.
 */

import type { SavedItem, SavedItemType } from "@/features/saved/domain/model";

type Props = {
  type: SavedItemType;
  referenceId: string;
  saved: SavedItem | undefined;
  onSave: (type: SavedItemType, referenceId: string) => void;
  onMarkMastered: (id: string) => void;
  onMarkActive: (id: string) => void;
  size?: "sm" | "md";
};

const baseBtn = "rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors";

export function SavedToggleButton({
  type,
  referenceId,
  saved,
  onSave,
  onMarkMastered,
  onMarkActive,
}: Props) {
  if (!saved) {
    return (
      <button
        type="button"
        onClick={() => onSave(type, referenceId)}
        className={`${baseBtn} border border-gray-300 bg-white hover:bg-gray-100`}
      >
        + 저장
      </button>
    );
  }

  if (saved.status === "active") {
    return (
      <span className="flex items-center gap-1">
        <span
          className={`${baseBtn} border border-green-300 bg-green-50 text-green-900`}
        >
          ✓ 저장됨
        </span>
        <button
          type="button"
          onClick={() => onMarkMastered(saved.id)}
          className={`${baseBtn} border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100`}
        >
          외움
        </button>
      </span>
    );
  }

  // mastered
  return (
    <span className="flex items-center gap-1">
      <span
        className={`${baseBtn} border border-blue-300 bg-blue-100 text-blue-900`}
      >
        ★ 외움
      </span>
      <button
        type="button"
        onClick={() => onMarkActive(saved.id)}
        className={`${baseBtn} border border-gray-300 bg-white hover:bg-gray-100`}
      >
        다시 학습
      </button>
    </span>
  );
}
