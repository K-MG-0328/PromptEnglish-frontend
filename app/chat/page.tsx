/**
 * /chat — 메인 대화 페이지 (3 영역 합성).
 *
 * 4-layer: 라우팅 entry
 * 역할: Application Hook 호출 + UI 합성 (대화/피드백/단어/대화 목록)
 * 의존성 방향:
 *   - import 가능: features/<*>/application, features/<*>/ui, ui/layout
 *   - import 금지: features/<*>/infrastructure (Hook이 위임)
 * 기술 선택:
 *   - 페이지가 모든 feature Hook을 호출한 뒤 props로만 UI 컴포넌트에 전달.
 *     features 간 직접 import는 금지(FE CLAUDE.md) — 페이지가 단방향 합성 책임.
 *   - send 성공 시 자동으로 (a) 피드백 추출 (b) 대화 목록 새로고침 (c) 단어 새로고침.
 *   - 새 대화 클릭 시 reset + conversation-list refresh.
 *   - 기존 대화 클릭 시 loadConversation + feedback/state 초기화.
 */

"use client";

import { useMemo } from "react";

import { useChat } from "@/features/chat/application/useChat";
import { ChatView } from "@/features/chat/ui/ChatView";
import { useConversationList } from "@/features/conversation-list/application/useConversationList";
import { ConversationListPanel } from "@/features/conversation-list/ui/ConversationListPanel";
import { useFeedback } from "@/features/feedback/application/useFeedback";
import { FeedbackPanel } from "@/features/feedback/ui/FeedbackPanel";
import { NEW_CONVERSATION_SENTINEL } from "@/features/chat/domain/sentinels";
import { useVocabulary } from "@/features/vocabulary/application/useVocabulary";
import { VocabularyPanel } from "@/features/vocabulary/ui/VocabularyPanel";
import { ThreeAreaLayout } from "@/ui/layout/ThreeAreaLayout";

export default function ChatPage() {
  const chat = useChat();
  const feedback = useFeedback();
  const vocabulary = useVocabulary();
  const conversationList = useConversationList();

  const latestUserMessageId = useMemo(() => {
    if (chat.turns.length === 0) return null;
    return chat.turns[chat.turns.length - 1].user.id;
  }, [chat.turns]);

  const latestFeedbacks = useMemo(() => {
    if (!latestUserMessageId) return [];
    return feedback.feedbacksFor(latestUserMessageId);
  }, [feedback, latestUserMessageId]);

  const handleSend = async (content: string) => {
    const result = await chat.send(content);
    if (!result) return;
    void feedback.extractFor(result.conversationId, result.turn.user.id);
    void conversationList.refresh();
    void vocabulary.refresh();
  };

  const handleSelectConversation = async (id: string) => {
    if (id === chat.conversationId) return;
    feedback.reset();
    await chat.loadConversation(id);
  };

  const handleCreateNew = () => {
    feedback.reset();
    chat.reset();
  };

  const activeId =
    chat.conversationId === NEW_CONVERSATION_SENTINEL ? null : chat.conversationId;

  return (
    <ThreeAreaLayout
      left={
        <ConversationListPanel
          conversations={conversationList.conversations}
          activeId={activeId}
          loading={conversationList.loading}
          error={conversationList.error}
          onSelect={handleSelectConversation}
          onCreateNew={handleCreateNew}
        />
      }
      center={
        <ChatView
          projectName={chat.projectName}
          turns={chat.turns}
          sending={chat.sending}
          error={chat.error}
          onSend={handleSend}
        />
      }
      right={
        <>
          <div className="h-1/2 overflow-hidden">
            <FeedbackPanel
              feedbacks={latestFeedbacks}
              extracting={feedback.extractingMessageId !== null}
              error={feedback.error}
              hasUserMessage={latestUserMessageId !== null}
            />
          </div>
          <div className="h-1/2 overflow-hidden">
            <VocabularyPanel
              entries={vocabulary.entries}
              loading={vocabulary.loading}
              error={vocabulary.error}
              onRefresh={() => void vocabulary.refresh()}
              onExpose={(id) => void vocabulary.markExposed(id)}
            />
          </div>
        </>
      }
    />
  );
}
