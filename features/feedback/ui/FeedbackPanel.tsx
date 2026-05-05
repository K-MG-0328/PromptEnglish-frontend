/**
 * features/feedback/ui/FeedbackPanel — 피드백 목록 패널.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/feedback/domain, features/feedback/ui/FeedbackCard
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - 메인 대화와 분리된 영역(데스크탑/iPad 3 영역 중 하나).
 *   - 추출 중 상태/에러는 props로 받아 표시.
 *   - 빈 상태는 "메시지를 입력하면 피드백이 표시됩니다" 안내.
 */

import type { Feedback } from "@/features/feedback/domain/model";
import { FeedbackCard } from "./FeedbackCard";

type Props = {
  feedbacks: readonly Feedback[];
  extracting: boolean;
  error: string | null;
  hasUserMessage: boolean;
};

export function FeedbackPanel({
  feedbacks,
  extracting,
  error,
  hasUserMessage,
}: Props) {
  return (
    <aside className="flex h-full flex-col gap-2 border-l border-gray-200 bg-gray-50 p-4">
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">피드백</h2>
        <span className="text-[10px] opacity-50">{feedbacks.length}건</span>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-900">
            {error}
          </div>
        )}

        {extracting && (
          <div className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] italic opacity-60">
            피드백 추출 중...
          </div>
        )}

        {!extracting && feedbacks.length === 0 && (
          <div className="grid h-full place-items-center text-center text-xs opacity-50">
            {hasUserMessage
              ? "이 메시지엔 피드백이 없습니다."
              : "메시지를 입력하면 피드백이 표시됩니다."}
          </div>
        )}

        {feedbacks.map((fb) => (
          <FeedbackCard key={fb.id} feedback={fb} />
        ))}
      </div>
    </aside>
  );
}
