/**
 * features/chat/ui/ChatInput — 메시지 입력 영역.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react
 *   - import 금지: application/atoms, infrastructure, jotai
 * 기술 선택:
 *   - 자체 textarea 상태만 보유 (전역 atom에 안 들어감 — 다른 feature가 알 필요 없음).
 *   - 송신 처리는 props.onSend로 위임 → 컨테이너(useChat)가 책임.
 */

"use client";

import { useState, type KeyboardEvent } from "react";

type Props = {
  disabled?: boolean;
  onSend: (content: string) => void;
};

export function ChatInput({ disabled = false, onSend }: Props) {
  const [draft, setDraft] = useState("");

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="메시지를 입력하세요... (⌘/Ctrl+Enter 송신)"
        rows={3}
        className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        disabled={disabled}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !draft.trim()}
          className="rounded bg-black px-4 py-1.5 text-sm text-white disabled:opacity-40"
        >
          {disabled ? "송신 중..." : "Send"}
        </button>
      </div>
    </div>
  );
}
