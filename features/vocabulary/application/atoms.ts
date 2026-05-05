/**
 * features/vocabulary/application/atoms — 단어 상태 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/vocabulary/domain
 *   - import 금지: infrastructure, ui, 다른 feature
 */

import { atom } from "jotai";

import type { VocabularyEntry } from "@/features/vocabulary/domain/model";

export const vocabularyAtom = atom<readonly VocabularyEntry[]>([]);
export const vocabularyLoadingAtom = atom<boolean>(false);
export const vocabularyErrorAtom = atom<string | null>(null);
