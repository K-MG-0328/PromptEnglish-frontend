/**
 * features/chat/application/atoms — 채팅 상태 atom.
 *
 * 4-layer: Application
 * 역할: State (Jotai atom)
 * 의존성 방향:
 *   - import 가능: jotai, features/chat/domain
 *   - import 금지: infrastructure, ui
 * 기술 선택:
 *   - Jotai atom — Provider 분리(AppLayout)로 feature 간 상태 격리. SSR 안전.
 *   - readonly 도메인 타입 + 불변 갱신 패턴으로 동시 turn append 시 race 방지.
 *   - conversationId는 sentinel("_")부터 출발해 첫 응답 후 실제 UUID로 교체.
 */

import { atom } from "jotai";

import type { ChatTurn } from "@/features/chat/domain/model";
import { NEW_CONVERSATION_SENTINEL } from "@/features/chat/domain/sentinels";

export const conversationIdAtom = atom<string>(NEW_CONVERSATION_SENTINEL);
export const projectNameAtom = atom<string | null>(null);
export const turnsAtom = atom<readonly ChatTurn[]>([]);
export const sendingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
