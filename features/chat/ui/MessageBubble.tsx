/**
 * features/chat/ui/MessageBubble — user 메시지 한 건 표시.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/chat/domain
 *   - import 금지: application/atoms, infrastructure
 * 기술 선택:
 *   - props로만 그리는 순수 컴포넌트. 내부 상태/effect 없음.
 *   - 시간 포맷은 짧게 (HH:mm). 상세 ISO는 title attribute에.
 */

import type { UserMessage } from "@/features/chat/domain/model";

type Props = {
  message: UserMessage;
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MessageBubble({ message }: Props) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[70%] rounded-2xl rounded-br-sm bg-black px-4 py-2 text-sm text-white"
        title={message.createdAt}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="mt-1 text-right text-[10px] opacity-60">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
