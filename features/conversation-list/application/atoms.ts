/**
 * features/conversation-list/application/atoms — 대화 목록 상태 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/conversation-list/domain
 *   - import 금지: infrastructure, ui, 다른 feature
 */

import { atom } from "jotai";

import type { ConversationSummary } from "@/features/conversation-list/domain/model";

export const conversationsAtom = atom<readonly ConversationSummary[]>([]);
export const conversationsLoadingAtom = atom<boolean>(false);
export const conversationsErrorAtom = atom<string | null>(null);
