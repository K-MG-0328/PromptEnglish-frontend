/**
 * features/feedback/application/useFeedback — 피드백 추출 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook (Domain 조립 + Infrastructure 호출)
 * 의존성 방향:
 *   - import 가능: features/feedback/domain, features/feedback/infrastructure,
 *     features/feedback/application/atoms, jotai, react
 *   - import 금지: ui, 다른 feature
 * 기술 선택:
 *   - 같은 messageId는 한 번만 추출 (이미 결과 있으면 skip).
 *   - 여러 메시지 동시 추출은 막음 — extractingMessageId atom으로 직렬화.
 *   - 결과 Map은 새 Map으로 재할당해 reference equality로 리렌더 트리거.
 */

"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import type { Feedback } from "@/features/feedback/domain/model";
import { extractFeedback } from "@/features/feedback/infrastructure/feedbackApi";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  extractingMessageIdAtom,
  feedbackErrorAtom,
  feedbacksByMessageIdAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export type UseFeedback = {
  readonly extractingMessageId: string | null;
  readonly error: string | null;
  readonly feedbacksByMessageId: ReadonlyMap<string, readonly Feedback[]>;
  feedbacksFor: (messageId: string) => readonly Feedback[];
  extractFor: (
    conversationId: string,
    messageId: string
  ) => Promise<readonly Feedback[]>;
  reset: () => void;
};

export function useFeedback(): UseFeedback {
  const feedbacksByMessageId = useAtomValue(feedbacksByMessageIdAtom);
  const extractingMessageId = useAtomValue(extractingMessageIdAtom);
  const error = useAtomValue(feedbackErrorAtom);

  const setMap = useSetAtom(feedbacksByMessageIdAtom);
  const setExtracting = useSetAtom(extractingMessageIdAtom);
  const setError = useSetAtom(feedbackErrorAtom);

  const feedbacksFor = useCallback(
    (messageId: string) => feedbacksByMessageId.get(messageId) ?? [],
    [feedbacksByMessageId]
  );

  const extractFor = useCallback(
    async (
      conversationId: string,
      messageId: string
    ): Promise<readonly Feedback[]> => {
      if (extractingMessageId) return [];
      setExtracting(messageId);
      setError(null);
      try {
        const feedbacks = await extractFeedback(conversationId, messageId);
        setMap((prev) => {
          const next = new Map(prev);
          next.set(messageId, feedbacks);
          return next;
        });
        return feedbacks;
      } catch (err) {
        setError(formatError(err));
        return [];
      } finally {
        setExtracting(null);
      }
    },
    [extractingMessageId, setError, setExtracting, setMap]
  );

  const reset = useCallback(() => {
    setMap(new Map());
    setError(null);
  }, [setError, setMap]);

  return {
    extractingMessageId,
    error,
    feedbacksByMessageId,
    feedbacksFor,
    extractFor,
    reset,
  };
}
