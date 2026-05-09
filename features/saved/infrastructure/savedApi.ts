/**
 * features/saved/infrastructure/savedApi — 저장 항목 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/saved/domain
 *   - import 금지: ui, features/saved/application
 * 기술 선택:
 *   - POST /saved-items 는 UPSERT (BE에서 reactivate 처리). FE는 같은 ref 다시 눌러도 안전.
 *   - PATCH /saved-items/{id}/status 는 active ↔ mastered 토글.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  SavedItem,
  SavedItemStatus,
  SavedItemType,
} from "@/features/saved/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type SavedItemDto = {
  id: string;
  type: SavedItemType;
  reference_id: string;
  status: SavedItemStatus;
  saved_at: string;
  last_status_change_at: string;
};

function mapSavedItem(dto: SavedItemDto): SavedItem {
  return {
    id: dto.id,
    type: dto.type,
    referenceId: dto.reference_id,
    status: dto.status,
    savedAt: dto.saved_at,
    lastStatusChangeAt: dto.last_status_change_at,
  };
}

export async function listSavedItems(params?: {
  status?: SavedItemStatus;
  type?: SavedItemType;
}): Promise<readonly SavedItem[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.type) search.set("type", params.type);
  const query = search.toString();
  const path = query ? `/saved-items?${query}` : `/saved-items`;
  const res = await httpClient<BaseResponse<SavedItemDto[]>>(path);
  return res.data.map(mapSavedItem);
}

export async function saveItem(
  type: SavedItemType,
  referenceId: string
): Promise<SavedItem> {
  const res = await httpClient<BaseResponse<SavedItemDto>>(`/saved-items`, {
    method: "POST",
    body: JSON.stringify({ type, reference_id: referenceId }),
  });
  return mapSavedItem(res.data);
}

export async function updateStatus(
  id: string,
  status: SavedItemStatus
): Promise<void> {
  await httpClient<BaseResponse<null>>(
    `/saved-items/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}
