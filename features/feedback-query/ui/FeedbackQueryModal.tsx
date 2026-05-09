/**
 * features/feedback-query/ui/FeedbackQueryModal — 피드백 질문 모달.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/feedback-query/domain, features/feedback/domain
 *   - import 금지: application, infrastructure
 * 기술 선택:
 *   - Tailwind만 사용 (외부 modal lib 없이 fixed inset-0).
 *   - ESC 키로 닫힘. 배경 클릭으로 닫힘.
 *   - 입력 ⌘/Ctrl+Enter로 전송.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type { Feedback } from "@/features/feedback/domain/model";
import type { FeedbackQuerySession } from "@/features/feedback-query/domain/model";

type Props = {
  open: boolean;
  feedback: Feedback | null;
  session: FeedbackQuerySession | null;
  pending: boolean;
  error: string | null;
  onAsk: (question: string) => void;
  onClose: () => void;
};

export function FeedbackQueryModal({
  open,
  feedback,
  session,
  pending,
  error,
  onAsk,
  onClose,
}: Props) {
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed || pending) return;
    onAsk(trimmed);
    setQuestion("");
  }, [onAsk, pending, question]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open || !feedback) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-[40rem] flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="text-sm font-semibold">💬 피드백 질문</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs opacity-60 hover:opacity-100"
          >
            닫기 (ESC)
          </button>
        </header>

        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs">
          <div className="font-mono opacity-60">
            <span>{feedback.category}</span>
          </div>
          <div className="mt-1 text-sm">
            <s className="opacity-60">{feedback.original}</s>{" "}
            <span className="opacity-60">→</span>{" "}
            <strong>{feedback.suggestion}</strong>
          </div>
          <div className="mt-1 text-xs opacity-70">{feedback.explanation}</div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
          {!session || session.qaSequence.length === 0 ? (
            <div className="text-center text-xs opacity-50">
              궁금한 점을 입력해 주세요.
            </div>
          ) : (
            session.qaSequence.map((qa, i) => (
              <div key={`qa-${i}`} className="space-y-1">
                <div className="rounded bg-gray-100 px-3 py-2 text-xs">
                  <span className="mr-1 font-semibold opacity-60">Q.</span>
                  {qa.question}
                </div>
                <div className="rounded bg-blue-50 px-3 py-2 text-xs leading-relaxed">
                  <span className="mr-1 font-semibold opacity-60">A.</span>
                  {qa.answer}
                </div>
              </div>
            ))
          )}
          {pending && (
            <div className="text-center text-xs italic opacity-50">
              답변 생성 중...
            </div>
          )}
          {error && (
            <div className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-900">
              {error}
            </div>
          )}
        </div>

        <footer className="border-t border-gray-200 px-4 py-2">
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="질문 입력 (⌘/Ctrl + Enter 전송)"
            rows={2}
            className="w-full resize-none rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-black focus:outline-none"
            disabled={pending}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!question.trim() || pending}
              className="rounded bg-black px-3 py-1 text-xs text-white disabled:opacity-30"
            >
              전송
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
