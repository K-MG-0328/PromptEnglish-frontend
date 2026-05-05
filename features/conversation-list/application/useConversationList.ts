/**
 * features/conversation-list/application/useConversationList — 대화 목록 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook
 * 의존성 방향:
 *   - import 가능: features/conversation-list/domain, features/conversation-list/infrastructure,
 *     features/conversation-list/application/atoms, jotai, react
 *   - import 금지: ui, 다른 feature
 * 기술 선택:
 *   - mount 시 자동 로드. 새 대화 생성 / 메시지 전송 직후 외부에서 refresh 호출.
 */

"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type { ConversationSummary } from "@/features/conversation-list/domain/model";
import { listConversations } from "@/features/conversation-list/infrastructure/conversationListApi";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  conversationsAtom,
  conversationsErrorAtom,
  conversationsLoadingAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export type UseConversationList = {
  readonly conversations: readonly ConversationSummary[];
  readonly loading: boolean;
  readonly error: string | null;
  refresh: () => Promise<void>;
};

export function useConversationList(autoload: boolean = true): UseConversationList {
  const conversations = useAtomValue(conversationsAtom);
  const loading = useAtomValue(conversationsLoadingAtom);
  const error = useAtomValue(conversationsErrorAtom);

  const setConversations = useSetAtom(conversationsAtom);
  const setLoading = useSetAtom(conversationsLoadingAtom);
  const setError = useSetAtom(conversationsErrorAtom);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await listConversations();
      setConversations(fresh);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [setConversations, setError, setLoading]);

  useEffect(() => {
    if (!autoload) return;
    void refresh();
  }, [autoload, refresh]);

  return { conversations, loading, error, refresh };
}
