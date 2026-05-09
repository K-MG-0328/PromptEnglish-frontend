/**
 * features/feedback-query/application/atoms — 피드백 질문 세션 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/feedback-query/domain
 *   - import 금지: infrastructure, ui, 다른 feature
 * 기술 선택:
 *   - 한 번에 하나의 modal만 열림 가정 — activeFeedbackId + activeSession 단일 슬롯.
 */

import { atom } from "jotai";

import type { FeedbackQuerySession } from "@/features/feedback-query/domain/model";

export const activeFeedbackIdAtom = atom<string | null>(null);
export const activeSessionAtom = atom<FeedbackQuerySession | null>(null);
export const queryPendingAtom = atom<boolean>(false);
export const queryErrorAtom = atom<string | null>(null);
