/**
 * features/conversation-list/ui/ConversationListPanel — 대화 목록 사이드 패널.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/conversation-list/domain
 *   - import 금지: application, infrastructure, 다른 feature
 * 기술 선택:
 *   - 새 대화 시작 / 기존 대화 전환 두 액션을 props 콜백으로 위임.
 *   - 활성 대화는 강조 (bg-black/text-white). 키보드 navigation은 후속 PR.
 *   - last_message_at 기준 가장 최근 5분 단위 형식 (간단 포맷).
 */

import type { ConversationSummary } from "@/features/conversation-list/domain/model";

type Props = {
  conversations: readonly ConversationSummary[];
  activeId: string | null;
  loading: boolean;
  error: string | null;
  onSelect: (conversationId: string) => void;
  onCreateNew: () => void;
};

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ConversationListPanel({
  conversations,
  activeId,
  loading,
  error,
  onSelect,
  onCreateNew,
}: Props) {
  return (
    <aside className="flex h-full flex-col gap-2 border-r border-gray-200 bg-gray-50 p-3">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">대화</h2>
        <button
          type="button"
          onClick={onCreateNew}
          className="rounded bg-black px-2 py-1 text-[11px] text-white"
        >
          + 새 대화
        </button>
      </header>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-900">
          {error}
        </div>
      )}

      <div className="flex-1 space-y-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="text-xs opacity-50">불러오는 중...</div>
        ) : conversations.length === 0 ? (
          <div className="text-xs opacity-50">대화가 없습니다.</div>
        ) : (
          conversations.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={`block w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <div className="truncate font-semibold">{c.projectName}</div>
                <div
                  className={`truncate text-[10px] ${
                    active ? "opacity-70" : "opacity-50"
                  }`}
                >
                  {formatRelative(c.lastMessageAt) || "방금 시작"}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
