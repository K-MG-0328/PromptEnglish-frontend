/**
 * features/learning-info/infrastructure/learningInfoApi — 학습 정보 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/learning-info/domain
 *   - import 금지: ui, features/learning-info/application
 * 기술 선택:
 *   - GET /learning-info?conversation_id=... — BE에서 LLM 호출 + Redis 캐시 (TTL 600s).
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  LearningInfo,
  LearningInfoSource,
} from "@/features/learning-info/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type LearningInfoItemDto = {
  korean: string;
  english: string;
  explanation: string | null;
};

type LearningInfoDto = {
  source: LearningInfoSource;
  items: LearningInfoItemDto[];
};

export async function getLearningInfo(
  conversationId: string
): Promise<LearningInfo> {
  const res = await httpClient<BaseResponse<LearningInfoDto>>(
    `/learning-info?conversation_id=${encodeURIComponent(conversationId)}`
  );
  return {
    source: res.data.source,
    items: res.data.items.map((i) => ({
      korean: i.korean,
      english: i.english,
      explanation: i.explanation,
    })),
  };
}
