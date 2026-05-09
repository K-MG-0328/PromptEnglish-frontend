/**
 * features/saved/application/atoms — 저장 항목 상태 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/saved/domain
 *   - import 금지: infrastructure, ui, 다른 feature
 * 기술 선택:
 *   - byKey 맵 — `${type}:${referenceId}` 키로 빠른 조회 (FeedbackCard/VocabularyEntry에서
 *     본인 항목이 저장됐는지 O(1)로 확인).
 */

import { atom } from "jotai";

import type { SavedItem } from "@/features/saved/domain/model";

export const savedItemsByKeyAtom = atom<ReadonlyMap<string, SavedItem>>(
  new Map()
);
export const savedLoadingAtom = atom<boolean>(false);
export const savedErrorAtom = atom<string | null>(null);
