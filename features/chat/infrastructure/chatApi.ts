/**
 * features/chat/infrastructure/chatApi — 채팅 API 어댑터.
 *
 * 4-layer: Infrastructure
 * 역할: API Adapter (BE REST 호출 → Domain 타입으로 매핑)
 * 의존성 방향:
 *   - import 가능: infrastructure/http/httpClient, features/chat/domain
 *   - import 금지: ui, features/chat/application
 * 기술 선택:
 *   - 응답 snake_case → camelCase 매핑 책임을 어댑터에 둔다.
 *     Application/UI는 BE 응답 형태를 알지 못하게 격리 → BE 변경에 application/ui 흔들리지 않음.
 *   - BaseResponse<T> 래핑은 BE common.response 표준. 여기서 풀고 data만 반환.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  ChatTurn,
  HighlightReason,
  HighlightedWord,
  Reply,
  SentencePair,
  UserMessage,
} from "@/features/chat/domain/model";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type SentencePairDto = {
  english: string;
  korean: string;
  highlighted_words: { text: string; reason: string }[];
};

type ReplyDto = {
  sentence_pairs: SentencePairDto[];
  generated_at: string;
};

type MessageDto = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  reply: ReplyDto | null;
};

type PostMessageDto = {
  conversation_id: string;
  project_name: string;
  user_message: MessageDto;
  assistant_message: MessageDto | null;
};

export type PostMessageResult = {
  conversationId: string;
  projectName: string;
  turn: ChatTurn;
};

function isHighlightReason(value: string): value is HighlightReason {
  return value === "vocab_gap" || value === "feedback";
}

function mapHighlight(dto: { text: string; reason: string }): HighlightedWord {
  return {
    text: dto.text,
    reason: isHighlightReason(dto.reason) ? dto.reason : "feedback",
  };
}

function mapSentencePair(dto: SentencePairDto): SentencePair {
  return {
    english: dto.english,
    korean: dto.korean,
    highlightedWords: dto.highlighted_words.map(mapHighlight),
  };
}

function mapReply(dto: ReplyDto | null): Reply | null {
  if (!dto) return null;
  return {
    sentencePairs: dto.sentence_pairs.map(mapSentencePair),
    generatedAt: dto.generated_at,
  };
}

function mapUser(dto: MessageDto): UserMessage {
  return {
    id: dto.id,
    content: dto.content,
    createdAt: dto.created_at,
  };
}

export async function postMessage(
  conversationId: string,
  content: string
): Promise<PostMessageResult> {
  const res = await httpClient<BaseResponse<PostMessageDto>>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );
  const data = res.data;
  return {
    conversationId: data.conversation_id,
    projectName: data.project_name,
    turn: {
      user: mapUser(data.user_message),
      reply: mapReply(data.assistant_message?.reply ?? null),
    },
  };
}

type ConversationDto = {
  id: string;
  project_name: string;
  project_summary: string | null;
  created_at: string;
  last_message_at: string | null;
  messages: MessageDto[];
};

export type LoadedConversation = {
  conversationId: string;
  projectName: string;
  turns: readonly ChatTurn[];
};

export async function getConversation(
  conversationId: string
): Promise<LoadedConversation> {
  const res = await httpClient<BaseResponse<ConversationDto>>(
    `/conversations/${encodeURIComponent(conversationId)}`
  );
  const data = res.data;
  const turns: ChatTurn[] = data.messages
    .filter((m) => m.role === "user")
    .map((m) => ({
      user: mapUser(m),
      reply: mapReply(m.reply),
    }));
  return {
    conversationId: data.id,
    projectName: data.project_name,
    turns,
  };
}
