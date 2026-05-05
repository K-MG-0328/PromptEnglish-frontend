/**
 * features/vocabulary/infrastructure/vocabularyApi — 단어 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/vocabulary/domain
 *   - import 금지: ui, features/vocabulary/application
 * 기술 선택:
 *   - GET /vocabulary는 least-exposed 정렬. limit 기본 20 (사이드 패널 화면 분량).
 *   - POST /vocabulary/{id}/exposure는 사이드 패널 노출 시 호출 (KR 3.3).
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { VocabularyEntry } from "@/features/vocabulary/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type VocabularyEntryDto = {
  id: string;
  korean: string;
  english: string;
  exposure_count: number;
  created_at: string;
  last_exposed_at: string | null;
  source_conversation_id: string | null;
};

function mapEntry(dto: VocabularyEntryDto): VocabularyEntry {
  return {
    id: dto.id,
    korean: dto.korean,
    english: dto.english,
    exposureCount: dto.exposure_count,
    createdAt: dto.created_at,
    lastExposedAt: dto.last_exposed_at,
    sourceConversationId: dto.source_conversation_id,
  };
}

export async function listVocabulary(
  limit: number = 20
): Promise<readonly VocabularyEntry[]> {
  const res = await httpClient<BaseResponse<VocabularyEntryDto[]>>(
    `/vocabulary?limit=${limit}`
  );
  return res.data.map(mapEntry);
}

export async function incrementExposure(entryId: string): Promise<void> {
  await httpClient<BaseResponse<null>>(`/vocabulary/${encodeURIComponent(entryId)}/exposure`, {
    method: "POST",
  });
}
