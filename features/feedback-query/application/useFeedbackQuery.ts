/**
 * features/feedback-query/application/useFeedbackQuery — 피드백 질문 세션 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook
 * 의존성 방향:
 *   - import 가능: features/feedback-query/*, jotai, react
 *   - import 금지: ui, 다른 feature
 * 기술 선택:
 *   - openFor는 modal 열기만 (세션 생성은 첫 ask 시점). 빈 세션 표시.
 *   - ask는 활성 세션 있으면 askQuestion, 없으면 startSession (BE가 활성 세션 재활용).
 *   - close는 명시 종료 + modal 닫기.
 */

"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import type { FeedbackQuerySession } from "@/features/feedback-query/domain/model";
import {
  askQuestion,
  closeSession,
  startSession,
} from "@/features/feedback-query/infrastructure/feedbackQueryApi";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  activeFeedbackIdAtom,
  activeSessionAtom,
  queryErrorAtom,
  queryPendingAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export type UseFeedbackQuery = {
  readonly activeFeedbackId: string | null;
  readonly session: FeedbackQuerySession | null;
  readonly pending: boolean;
  readonly error: string | null;
  openFor: (feedbackId: string) => void;
  ask: (question: string) => Promise<void>;
  close: () => Promise<void>;
  reset: () => void;
};

export function useFeedbackQuery(): UseFeedbackQuery {
  const activeFeedbackId = useAtomValue(activeFeedbackIdAtom);
  const session = useAtomValue(activeSessionAtom);
  const pending = useAtomValue(queryPendingAtom);
  const error = useAtomValue(queryErrorAtom);

  const setFeedbackId = useSetAtom(activeFeedbackIdAtom);
  const setSession = useSetAtom(activeSessionAtom);
  const setPending = useSetAtom(queryPendingAtom);
  const setError = useSetAtom(queryErrorAtom);

  const openFor = useCallback(
    (feedbackId: string) => {
      setFeedbackId(feedbackId);
      setSession(null);
      setError(null);
    },
    [setError, setFeedbackId, setSession]
  );

  const ask = useCallback(
    async (question: string) => {
      if (!activeFeedbackId) return;
      setPending(true);
      setError(null);
      try {
        const next =
          session && session.id
            ? await askQuestion(session.id, question)
            : await startSession(activeFeedbackId, question);
        setSession(next);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setPending(false);
      }
    },
    [activeFeedbackId, session, setError, setPending, setSession]
  );

  const close = useCallback(async () => {
    if (session && session.id) {
      try {
        await closeSession(session.id);
      } catch (err) {
        setError(formatError(err));
      }
    }
    setFeedbackId(null);
    setSession(null);
  }, [session, setError, setFeedbackId, setSession]);

  const reset = useCallback(() => {
    setFeedbackId(null);
    setSession(null);
    setError(null);
  }, [setError, setFeedbackId, setSession]);

  return { activeFeedbackId, session, pending, error, openFor, ask, close, reset };
}
