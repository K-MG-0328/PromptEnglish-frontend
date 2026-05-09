/**
 * features/feedback/ui/FeedbackCard — 피드백 한 건 카드.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/feedback/domain
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - 카테고리/severity별 색조 분리 (학습 즉각 인지).
 *     grammar=red / word_choice=amber / context=blue.
 *   - patternId 존재 시 "캐시 히트" 마커 (KR 2.5 적중률 가시화).
 */

import type { Feedback } from "@/features/feedback/domain/model";

type Props = {
  feedback: Feedback;
  onAskQuestion?: (feedbackId: string) => void;
};

const CATEGORY_STYLE: Record<Feedback["category"], string> = {
  grammar: "border-red-300 bg-red-50",
  word_choice: "border-amber-300 bg-amber-50",
  context: "border-blue-300 bg-blue-50",
};

const SEVERITY_LABEL: Record<Feedback["severity"], string> = {
  high: "강",
  mid: "중",
  low: "약",
};

export function FeedbackCard({ feedback, onAskQuestion }: Props) {
  return (
    <div className={`rounded border ${CATEGORY_STYLE[feedback.category]} p-3 text-xs`}>
      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase">
        <span className="rounded bg-white px-1.5 py-0.5 font-mono">
          {feedback.category}
        </span>
        <span className="opacity-60">강도: {SEVERITY_LABEL[feedback.severity]}</span>
        {feedback.patternId && (
          <span className="ml-auto rounded bg-white px-1.5 py-0.5 font-mono text-[9px] opacity-70">
            cache hit
          </span>
        )}
      </div>
      <div className="text-sm">
        <s className="opacity-60">{feedback.original}</s>{" "}
        <span className="text-base">→</span>{" "}
        <strong>{feedback.suggestion}</strong>
      </div>
      <div className="mt-1 text-xs leading-relaxed opacity-75">
        {feedback.explanation}
      </div>
      {feedback.relatedAspects.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1 text-[10px] opacity-60">
          {feedback.relatedAspects.map((a) => (
            <span key={a} className="rounded bg-white/60 px-1.5 py-0.5 font-mono">
              {a}
            </span>
          ))}
        </div>
      )}
      {onAskQuestion && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onAskQuestion(feedback.id)}
            className="rounded bg-white/70 px-2 py-0.5 text-[10px] hover:bg-white"
          >
            💬 질문하기
          </button>
        </div>
      )}
    </div>
  );
}
