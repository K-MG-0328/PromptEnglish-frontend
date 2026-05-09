/**
 * features/learning-info/application/useLearningInfo — 학습 정보 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook
 * 의존성 방향:
 *   - import 가능: features/learning-info/*, jotai, react
 *   - import 금지: ui, 다른 feature
 * 기술 선택:
 *   - conversationId가 바뀌면 자동 재조회. null/sentinel은 skip.
 *   - Redis 캐시(BE)가 있어 같은 conversation 두 번 호출 시 매우 빠름.
 */

"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type { LearningInfo } from "@/features/learning-info/domain/model";
import { getLearningInfo } from "@/features/learning-info/infrastructure/learningInfoApi";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  learningInfoAtom,
  learningInfoErrorAtom,
  learningInfoLoadingAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export type UseLearningInfo = {
  readonly info: LearningInfo | null;
  readonly loading: boolean;
  readonly error: string | null;
  refresh: () => Promise<void>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useLearningInfo(conversationId: string | null): UseLearningInfo {
  const info = useAtomValue(learningInfoAtom);
  const loading = useAtomValue(learningInfoLoadingAtom);
  const error = useAtomValue(learningInfoErrorAtom);

  const setInfo = useSetAtom(learningInfoAtom);
  const setLoading = useSetAtom(learningInfoLoadingAtom);
  const setError = useSetAtom(learningInfoErrorAtom);

  const refresh = useCallback(async () => {
    if (!conversationId || !UUID_PATTERN.test(conversationId)) {
      setInfo(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fresh = await getLearningInfo(conversationId);
      setInfo(fresh);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [conversationId, setError, setInfo, setLoading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { info, loading, error, refresh };
}
