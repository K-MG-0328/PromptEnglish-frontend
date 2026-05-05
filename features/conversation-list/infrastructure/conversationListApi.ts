/**
 * features/conversation-list/infrastructure/conversationListApi — 대화 목록 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/conversation-list/domain
 *   - import 금지: ui, features/conversation-list/application
 * 기술 선택:
 *   - GET /conversations는 last_message_at 내림차순 정렬 (BE에서). 별도 정렬 안 함.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ConversationSummary } from "@/features/conversation-list/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type ConversationSummaryDto = {
  id: string;
  project_name: string;
  project_summary: string | null;
  created_at: string;
  last_message_at: string | null;
};

function mapSummary(dto: ConversationSummaryDto): ConversationSummary {
  return {
    id: dto.id,
    projectName: dto.project_name,
    projectSummary: dto.project_summary,
    createdAt: dto.created_at,
    lastMessageAt: dto.last_message_at,
  };
}

export async function listConversations(): Promise<readonly ConversationSummary[]> {
  const res = await httpClient<BaseResponse<ConversationSummaryDto[]>>(
    `/conversations`
  );
  return res.data.map(mapSummary);
}
