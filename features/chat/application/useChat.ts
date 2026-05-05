/**
 * features/chat/application/useChat — 채팅 송신 흐름 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook (Domain 타입을 조립하고 Infrastructure를 호출)
 * 의존성 방향:
 *   - import 가능: features/chat/domain, features/chat/infrastructure/chatApi,
 *     features/chat/application/atoms, jotai, react
 *   - import 금지: ui, 다른 feature의 application/ui
 * 기술 선택:
 *   - useAtom 대신 useAtomValue + useSetAtom 쌍 — 불필요한 리렌더 방지.
 *   - send는 sending=true 분기로 동시 호출을 방어. 직전 호출이 진행 중이면 무시.
 *   - send 결과를 반환 → 페이지가 후속 feedback 추출을 chain 할 수 있게.
 *   - reset/loadConversation은 사이드바(대화 목록)와 합성될 때 사용.
 */

"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import {
  getConversation,
  postMessage,
  type PostMessageResult,
} from "@/features/chat/infrastructure/chatApi";
import type { ChatTurn } from "@/features/chat/domain/model";
import { NEW_CONVERSATION_SENTINEL } from "@/features/chat/domain/sentinels";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  conversationIdAtom,
  errorAtom,
  projectNameAtom,
  sendingAtom,
  turnsAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export type UseChat = {
  readonly conversationId: string;
  readonly projectName: string | null;
  readonly turns: readonly ChatTurn[];
  readonly sending: boolean;
  readonly error: string | null;
  send: (content: string) => Promise<PostMessageResult | null>;
  reset: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
};

export function useChat(): UseChat {
  const conversationId = useAtomValue(conversationIdAtom);
  const projectName = useAtomValue(projectNameAtom);
  const turns = useAtomValue(turnsAtom);
  const sending = useAtomValue(sendingAtom);
  const error = useAtomValue(errorAtom);

  const setConversationId = useSetAtom(conversationIdAtom);
  const setProjectName = useSetAtom(projectNameAtom);
  const setTurns = useSetAtom(turnsAtom);
  const setSending = useSetAtom(sendingAtom);
  const setError = useSetAtom(errorAtom);

  const send = useCallback(
    async (content: string): Promise<PostMessageResult | null> => {
      const trimmed = content.trim();
      if (!trimmed) return null;
      if (sending) return null;

      setSending(true);
      setError(null);
      try {
        const result = await postMessage(conversationId, trimmed);
        setConversationId(result.conversationId);
        setProjectName(result.projectName);
        setTurns((prev) => [...prev, result.turn]);
        return result;
      } catch (err) {
        setError(formatError(err));
        return null;
      } finally {
        setSending(false);
      }
    },
    [
      conversationId,
      sending,
      setConversationId,
      setError,
      setProjectName,
      setSending,
      setTurns,
    ]
  );

  const reset = useCallback(() => {
    setConversationId(NEW_CONVERSATION_SENTINEL);
    setProjectName(null);
    setTurns([]);
    setError(null);
  }, [setConversationId, setError, setProjectName, setTurns]);

  const loadConversation = useCallback(
    async (id: string) => {
      if (sending) return;
      setSending(true);
      setError(null);
      try {
        const loaded = await getConversation(id);
        setConversationId(loaded.conversationId);
        setProjectName(loaded.projectName);
        setTurns(loaded.turns);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setSending(false);
      }
    },
    [sending, setConversationId, setError, setProjectName, setSending, setTurns]
  );

  return {
    conversationId,
    projectName,
    turns,
    sending,
    error,
    send,
    reset,
    loadConversation,
  };
}
