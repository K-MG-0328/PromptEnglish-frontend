/**
 * features/chat/ui/ChatView — 채팅 한 영역(메인) 합성 컴포넌트.
 *
 * 4-layer: UI
 * 역할: Component (Dumb composer)
 * 의존성 방향:
 *   - import 가능: react, features/chat/domain, features/chat/ui/*
 *   - import 금지: application/atoms, infrastructure (props로만 받음)
 * 기술 선택:
 *   - 자식 컴포넌트(ChatInput / MessageBubble / AssistantReply)들을 한 layout 안에 배치.
 *   - 상태/송신 함수는 props로만 받음 → 페이지 레벨에서 useChat과 결합.
 *   - 새 turn 추가 시 자동 스크롤.
 */

"use client";

import { useEffect, useRef } from "react";

import type { ChatTurn } from "@/features/chat/domain/model";
import { AssistantReply } from "./AssistantReply";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

type Props = {
  projectName: string | null;
  turns: readonly ChatTurn[];
  sending: boolean;
  error: string | null;
  onSend: (content: string) => void;
};

export function ChatView({
  projectName,
  turns,
  sending,
  error,
  onSend,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns.length, sending]);

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-3 p-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold">
          {projectName ?? "새 대화"}
        </h1>
        <span className="text-xs opacity-50">
          {turns.length} turn
          {turns.length === 1 ? "" : "s"}
        </span>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto rounded border border-gray-200 bg-white p-3"
      >
        {turns.length === 0 && !sending ? (
          <div className="grid h-full place-items-center text-sm opacity-50">
            메시지를 보내 대화를 시작하세요.
          </div>
        ) : (
          turns.map((turn) => (
            <div key={turn.user.id} className="space-y-2">
              <MessageBubble message={turn.user} />
              {turn.reply && <AssistantReply reply={turn.reply} />}
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2 text-xs italic opacity-60">
              답변 생성 중...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-900">
          {error}
        </div>
      )}

      <ChatInput disabled={sending} onSend={onSend} />
    </div>
  );
}
