/**
 * features/daily-summary/infrastructure/dailySummaryApi — 하루 학습 정리 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/daily-summary/domain
 *   - import 금지: ui, features/daily-summary/application
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  DailySummary,
  DailySummaryFilter,
  DailySummaryItem,
  DailySummaryItemKind,
} from "@/features/daily-summary/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type DailySummaryItemDto = {
  kind: DailySummaryItemKind;
  occurred_at: string;
  conversation_id: string | null;
  project_name: string | null;
  event_id: string;
  saved_status: "active" | "mastered" | null;
  payload: Record<string, unknown>;
};

type DailySummaryDto = {
  date: string;
  items: DailySummaryItemDto[];
};

function mapPayload(
  kind: DailySummaryItemKind,
  raw: Record<string, unknown>
): DailySummaryItem["payload"] {
  if (kind === "vocabulary") {
    return {
      korean: String(raw.korean ?? ""),
      english: String(raw.english ?? ""),
      exposureCount: Number(raw.exposure_count ?? 0),
    };
  }
  // feedback
  return {
    severity: String(raw.severity ?? ""),
    original: String(raw.original ?? ""),
    suggestion: String(raw.suggestion ?? ""),
    explanation: String(raw.explanation ?? ""),
    relatedAspects: Array.isArray(raw.related_aspects)
      ? raw.related_aspects.map(String)
      : [],
    category: String(raw.category ?? ""),
    messageId: String(raw.message_id ?? ""),
  };
}

function mapItem(dto: DailySummaryItemDto): DailySummaryItem {
  return {
    kind: dto.kind,
    occurredAt: dto.occurred_at,
    conversationId: dto.conversation_id,
    projectName: dto.project_name,
    eventId: dto.event_id,
    savedStatus: dto.saved_status,
    payload: mapPayload(dto.kind, dto.payload),
  };
}

export async function getDailySummary(
  date: string, // YYYY-MM-DD
  filter: DailySummaryFilter
): Promise<DailySummary> {
  const search = new URLSearchParams();
  search.set("date", date);
  if (filter.category) search.set("category", filter.category);
  if (filter.conversationId) search.set("conversation_id", filter.conversationId);
  if (filter.saved !== null) search.set("saved", String(filter.saved));
  const res = await httpClient<BaseResponse<DailySummaryDto>>(
    `/daily-summary?${search.toString()}`
  );
  return {
    date: res.data.date,
    items: res.data.items.map(mapItem),
  };
}
