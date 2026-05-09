/**
 * features/learning-info/application/atoms — 학습 정보 상태 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/learning-info/domain
 *   - import 금지: infrastructure, ui, 다른 feature
 */

import { atom } from "jotai";

import type { LearningInfo } from "@/features/learning-info/domain/model";

export const learningInfoAtom = atom<LearningInfo | null>(null);
export const learningInfoLoadingAtom = atom<boolean>(false);
export const learningInfoErrorAtom = atom<string | null>(null);
