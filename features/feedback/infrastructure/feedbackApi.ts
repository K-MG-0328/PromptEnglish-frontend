/**
 * features/feedback/infrastructure/feedbackApi — 피드백 추출 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter (BE REST 호출 → Domain 타입으로 매핑)
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/feedback/domain
 *   - import 금지: ui, features/feedback/application
 * 기술 선택:
 *   - extract(POST /feedback/extract)는 LLM 호출이 발생하는 무거운 작업.
 *     호출 빈도 통제(useFeedback) + 캐시 히트(M4) 시 빠르게 반환.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  Feedback,
  FeedbackCategory,
  FeedbackSeverity,
} from "@/features/feedback/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type FeedbackDto = {
  id: string;
  conversation_id: string;
  message_id: string;
  category: string;
  severity: string;
  original: string;
  suggestion: string;
  explanation: string;
  related_aspects: string[];
  pattern_id: string | null;
  created_at: string | null;
};

const CATEGORIES: readonly FeedbackCategory[] = [
  "grammar",
  "word_choice",
  "context",
];
const SEVERITIES: readonly FeedbackSeverity[] = ["high", "mid", "low"];

function isCategory(v: string): v is FeedbackCategory {
  return (CATEGORIES as readonly string[]).includes(v);
}
function isSeverity(v: string): v is FeedbackSeverity {
  return (SEVERITIES as readonly string[]).includes(v);
}

function mapFeedback(dto: FeedbackDto): Feedback {
  return {
    id: dto.id,
    conversationId: dto.conversation_id,
    messageId: dto.message_id,
    category: isCategory(dto.category) ? dto.category : "grammar",
    severity: isSeverity(dto.severity) ? dto.severity : "mid",
    original: dto.original,
    suggestion: dto.suggestion,
    explanation: dto.explanation,
    relatedAspects: dto.related_aspects,
    patternId: dto.pattern_id,
    createdAt: dto.created_at,
  };
}

export async function extractFeedback(
  conversationId: string,
  messageId: string
): Promise<readonly Feedback[]> {
  const res = await httpClient<BaseResponse<FeedbackDto[]>>(`/feedback/extract`, {
    method: "POST",
    body: JSON.stringify({
      conversation_id: conversationId,
      message_id: messageId,
    }),
  });
  return res.data.map(mapFeedback);
}
