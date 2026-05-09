/**
 * features/daily-summary/application/atoms — 하루 학습 정리 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/daily-summary/domain
 *   - import 금지: infrastructure, ui, 다른 feature
 */

import { atom } from "jotai";

import type {
  DailySummary,
  DailySummaryFilter,
} from "@/features/daily-summary/domain/model";

function todayKst(): string {
  // KST 기준 오늘 (브라우저 시간 기준 — 사용자가 한국에서 사용한다는 가정)
  const now = new Date();
  const offset = 9 * 60; // KST = UTC+9
  const local = new Date(now.getTime() + offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export const summaryDateAtom = atom<string>(todayKst());
export const summaryFilterAtom = atom<DailySummaryFilter>({
  category: null,
  conversationId: null,
  saved: null,
});
export const summaryAtom = atom<DailySummary | null>(null);
export const summaryLoadingAtom = atom<boolean>(false);
export const summaryErrorAtom = atom<string | null>(null);
