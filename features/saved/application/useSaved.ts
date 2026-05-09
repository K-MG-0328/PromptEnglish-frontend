/**
 * features/saved/application/useSaved — 저장 항목 UseCase Hook.
 *
 * 4-layer: Application
 * 역할: UseCase Hook
 * 의존성 방향:
 *   - import 가능: features/saved/domain, features/saved/infrastructure,
 *     features/saved/application/atoms, jotai, react
 *   - import 금지: ui, 다른 feature
 * 기술 선택:
 *   - mount 시 자동 로드. byReference 맵으로 항목별 status 조회 O(1).
 *   - save/markMastered/markActive는 낙관적 갱신 후 BE 호출.
 *   - 새 항목 추가 시 임시 id가 없으므로 refresh로 보정 (mastered/active 토글은 id 알고 있어 낙관 갱신).
 */

"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type {
  SavedItem,
  SavedItemStatus,
  SavedItemType,
} from "@/features/saved/domain/model";
import {
  listSavedItems,
  saveItem,
  updateStatus,
} from "@/features/saved/infrastructure/savedApi";
import { HttpError } from "@/infrastructure/http/httpClient";
import {
  savedErrorAtom,
  savedItemsByKeyAtom,
  savedLoadingAtom,
} from "./atoms";

function formatError(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

function makeKey(type: SavedItemType, referenceId: string): string {
  return `${type}:${referenceId}`;
}

export type UseSaved = {
  readonly byKey: ReadonlyMap<string, SavedItem>;
  readonly loading: boolean;
  readonly error: string | null;
  refresh: () => Promise<void>;
  save: (type: SavedItemType, referenceId: string) => Promise<SavedItem | null>;
  markMastered: (id: string) => Promise<void>;
  markActive: (id: string) => Promise<void>;
  isSavedActive: (type: SavedItemType, referenceId: string) => boolean;
  getByReference: (
    type: SavedItemType,
    referenceId: string
  ) => SavedItem | undefined;
};

export function useSaved(autoload: boolean = true): UseSaved {
  const byKey = useAtomValue(savedItemsByKeyAtom);
  const loading = useAtomValue(savedLoadingAtom);
  const error = useAtomValue(savedErrorAtom);

  const setByKey = useSetAtom(savedItemsByKeyAtom);
  const setLoading = useSetAtom(savedLoadingAtom);
  const setError = useSetAtom(savedErrorAtom);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listSavedItems();
      const map = new Map<string, SavedItem>();
      for (const it of items) {
        map.set(makeKey(it.type, it.referenceId), it);
      }
      setByKey(map);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [setByKey, setError, setLoading]);

  const save = useCallback(
    async (
      type: SavedItemType,
      referenceId: string
    ): Promise<SavedItem | null> => {
      try {
        const item = await saveItem(type, referenceId);
        setByKey((prev) => {
          const next = new Map(prev);
          next.set(makeKey(item.type, item.referenceId), item);
          return next;
        });
        return item;
      } catch (err) {
        setError(formatError(err));
        return null;
      }
    },
    [setByKey, setError]
  );

  const updateStatusOptimistic = useCallback(
    async (id: string, nextStatus: SavedItemStatus) => {
      setByKey((prev) => {
        const next = new Map(prev);
        for (const [k, v] of prev) {
          if (v.id === id) {
            next.set(k, {
              ...v,
              status: nextStatus,
              lastStatusChangeAt: new Date().toISOString(),
            });
          }
        }
        return next;
      });
      try {
        await updateStatus(id, nextStatus);
      } catch (err) {
        setError(formatError(err));
        // 실패 시 서버 상태로 복원
        await refresh();
      }
    },
    [refresh, setByKey, setError]
  );

  const markMastered = useCallback(
    (id: string) => updateStatusOptimistic(id, "mastered"),
    [updateStatusOptimistic]
  );

  const markActive = useCallback(
    (id: string) => updateStatusOptimistic(id, "active"),
    [updateStatusOptimistic]
  );

  const isSavedActive = useCallback(
    (type: SavedItemType, referenceId: string) => {
      const item = byKey.get(makeKey(type, referenceId));
      return item !== undefined && item.status === "active";
    },
    [byKey]
  );

  const getByReference = useCallback(
    (type: SavedItemType, referenceId: string) =>
      byKey.get(makeKey(type, referenceId)),
    [byKey]
  );

  useEffect(() => {
    if (!autoload) return;
    void refresh();
  }, [autoload, refresh]);

  return {
    byKey,
    loading,
    error,
    refresh,
    save,
    markMastered,
    markActive,
    isSavedActive,
    getByReference,
  };
}
