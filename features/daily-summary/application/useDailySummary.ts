/**
 * features/daily-summary/application/useDailySummary — 하루 학습 정리 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook
 * 의존성 방향:
 *   - import 가능: features/daily-summary/*, jotai, react
 *   - import 금지: ui, 다른 feature
 * 기술 선택:
 *   - drawer가 열릴 때만 자동 조회 (open=true && active 변경 시).
 *   - 필터 변경 시 즉시 재조회.
 */

"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type {
  DailySummary,
  DailySummaryFilter,
} from "@/features/daily-summary/domain/model";
import { getDailySummary } from "@/features/daily-summary/infrastructure/dailySummaryApi";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  summaryAtom,
  summaryDateAtom,
  summaryErrorAtom,
  summaryFilterAtom,
  summaryLoadingAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export type UseDailySummary = {
  readonly date: string;
  readonly filter: DailySummaryFilter;
  readonly summary: DailySummary | null;
  readonly loading: boolean;
  readonly error: string | null;
  setDate: (date: string) => void;
  setFilter: (filter: DailySummaryFilter) => void;
  refresh: () => Promise<void>;
};

export function useDailySummary(active: boolean = true): UseDailySummary {
  const [date, setDate] = useAtom(summaryDateAtom);
  const [filter, setFilter] = useAtom(summaryFilterAtom);
  const summary = useAtomValue(summaryAtom);
  const loading = useAtomValue(summaryLoadingAtom);
  const error = useAtomValue(summaryErrorAtom);

  const setSummary = useSetAtom(summaryAtom);
  const setLoading = useSetAtom(summaryLoadingAtom);
  const setError = useSetAtom(summaryErrorAtom);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await getDailySummary(date, filter);
      setSummary(fresh);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [date, filter, setError, setLoading, setSummary]);

  useEffect(() => {
    if (!active) return;
    void refresh();
  }, [active, refresh]);

  return {
    date,
    filter,
    summary,
    loading,
    error,
    setDate,
    setFilter,
    refresh,
  };
}
