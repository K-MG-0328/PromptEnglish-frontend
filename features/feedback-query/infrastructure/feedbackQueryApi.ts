/**
 * features/feedback-query/infrastructure/feedbackQueryApi — 피드백 질문 세션 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/feedback-query/domain
 *   - import 금지: ui, features/feedback-query/application
 * 기술 선택:
 *   - POST /feedback/{id}/query-sessions: 신규 세션 또는 기존 활성 세션에 첫 질문 추가.
 *   - POST /query-sessions/{id}/questions: 후속 질문.
 *   - PATCH /query-sessions/{id}/close: 명시 종료.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  FeedbackQuerySession,
  QAEntry,
} from "@/features/feedback-query/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type QAEntryDto = {
  question: string;
  answer: string;
  asked_at: string;
};

type FeedbackQuerySessionDto = {
  id: string;
  feedback_id: string;
  qa_sequence: QAEntryDto[];
  started_at: string | null;
  last_activity_at: string | null;
  is_closed: boolean;
};

function mapQA(dto: QAEntryDto): QAEntry {
  return { question: dto.question, answer: dto.answer, askedAt: dto.asked_at };
}

function mapSession(dto: FeedbackQuerySessionDto): FeedbackQuerySession {
  return {
    id: dto.id,
    feedbackId: dto.feedback_id,
    qaSequence: dto.qa_sequence.map(mapQA),
    startedAt: dto.started_at,
    lastActivityAt: dto.last_activity_at,
    isClosed: dto.is_closed,
  };
}

export async function startSession(
  feedbackId: string,
  question: string
): Promise<FeedbackQuerySession> {
  const res = await httpClient<BaseResponse<FeedbackQuerySessionDto>>(
    `/feedback/${encodeURIComponent(feedbackId)}/query-sessions`,
    {
      method: "POST",
      body: JSON.stringify({ question }),
    }
  );
  return mapSession(res.data);
}

export async function askQuestion(
  sessionId: string,
  question: string
): Promise<FeedbackQuerySession> {
  const res = await httpClient<BaseResponse<FeedbackQuerySessionDto>>(
    `/query-sessions/${encodeURIComponent(sessionId)}/questions`,
    {
      method: "POST",
      body: JSON.stringify({ question }),
    }
  );
  return mapSession(res.data);
}

export async function closeSession(sessionId: string): Promise<void> {
  await httpClient<BaseResponse<null>>(
    `/query-sessions/${encodeURIComponent(sessionId)}/close`,
    { method: "PATCH" }
  );
}
