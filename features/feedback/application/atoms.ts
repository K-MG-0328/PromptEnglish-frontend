/**
 * features/feedback/application/atoms — 피드백 상태 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/feedback/domain
 *   - import 금지: infrastructure, ui, 다른 feature
 * 기술 선택:
 *   - messageId별 결과를 Map으로 보관 — 같은 메시지 재추출 안 하도록.
 *   - extractingMessageId는 단일 동시 추출 보장 (다중 추출은 제어 복잡).
 */

import { atom } from "jotai";

import type { Feedback } from "@/features/feedback/domain/model";

export const feedbacksByMessageIdAtom = atom<
  ReadonlyMap<string, readonly Feedback[]>
>(new Map());
export const extractingMessageIdAtom = atom<string | null>(null);
export const feedbackErrorAtom = atom<string | null>(null);
