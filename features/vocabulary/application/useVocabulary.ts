/**
 * features/vocabulary/application/useVocabulary — 단어 목록 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook
 * 의존성 방향:
 *   - import 가능: features/vocabulary/domain, features/vocabulary/infrastructure,
 *     features/vocabulary/application/atoms, jotai, react
 *   - import 금지: ui, 다른 feature
 * 기술 선택:
 *   - mount 시 자동 로드 (사용자가 수동으로 클릭하지 않아도 사이드 패널이 채워지도록).
 *   - refresh: 새 단어 추출 후 호출 (PostMessage 성공 시 페이지가 트리거).
 *   - markExposed는 노출 카운트 증가 + 낙관적으로 로컬 캐시 업데이트.
 */

"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type { VocabularyEntry } from "@/features/vocabulary/domain/model";
import {
  incrementExposure,
  listVocabulary,
} from "@/features/vocabulary/infrastructure/vocabularyApi";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  vocabularyAtom,
  vocabularyErrorAtom,
  vocabularyLoadingAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export type UseVocabulary = {
  readonly entries: readonly VocabularyEntry[];
  readonly loading: boolean;
  readonly error: string | null;
  refresh: () => Promise<void>;
  markExposed: (entryId: string) => Promise<void>;
};

export function useVocabulary(autoload: boolean = true): UseVocabulary {
  const entries = useAtomValue(vocabularyAtom);
  const loading = useAtomValue(vocabularyLoadingAtom);
  const error = useAtomValue(vocabularyErrorAtom);

  const setEntries = useSetAtom(vocabularyAtom);
  const setLoading = useSetAtom(vocabularyLoadingAtom);
  const setError = useSetAtom(vocabularyErrorAtom);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await listVocabulary(20);
      setEntries(fresh);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [setEntries, setError, setLoading]);

  const markExposed = useCallback(
    async (entryId: string) => {
      try {
        await incrementExposure(entryId);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  exposureCount: e.exposureCount + 1,
                  lastExposedAt: new Date().toISOString(),
                }
              : e
          )
        );
      } catch (err) {
        setError(formatError(err));
      }
    },
    [setEntries, setError]
  );

  useEffect(() => {
    if (!autoload) return;
    void refresh();
  }, [autoload, refresh]);

  return { entries, loading, error, refresh, markExposed };
}
