/**
 * /chat — 메인 대화 페이지 (3 영역 + drawer + modal 합성).
 *
 * 4-layer: 라우팅 entry
 * 역할: Application Hook 호출 + UI 합성
 * 의존성 방향:
 *   - import 가능: features/<*>/application, features/<*>/ui, ui/layout
 *   - import 금지: features/<*>/infrastructure (Hook이 위임)
 * 기술 선택:
 *   - 7개 feature Hook 합성. send 후 chain (feedback / vocab / convList / saved 모두 refresh).
 *   - 우측 상단 [📅 오늘 학습] → DailySummaryDrawer.
 *   - FeedbackCard "💬 질문하기" → FeedbackQueryModal.
 *   - 우측 상단 패널은 Feedback (0건이면 LearningInfo fallback).
 *   - VocabularyPanel은 saved active 항목 먼저 표시 (B-2 우선 정렬).
 */

"use client";

import { useMemo, useState } from "react";

import { useChat } from "@/features/chat/application/useChat";
import { NEW_CONVERSATION_SENTINEL } from "@/features/chat/domain/sentinels";
import { ChatView } from "@/features/chat/ui/ChatView";
import { useConversationList } from "@/features/conversation-list/application/useConversationList";
import { ConversationListPanel } from "@/features/conversation-list/ui/ConversationListPanel";
import { useDailySummary } from "@/features/daily-summary/application/useDailySummary";
import { DailySummaryDrawer } from "@/features/daily-summary/ui/DailySummaryDrawer";
import { useFeedback } from "@/features/feedback/application/useFeedback";
import { FeedbackPanel } from "@/features/feedback/ui/FeedbackPanel";
import { useFeedbackQuery } from "@/features/feedback-query/application/useFeedbackQuery";
import { FeedbackQueryModal } from "@/features/feedback-query/ui/FeedbackQueryModal";
import { useLearningInfo } from "@/features/learning-info/application/useLearningInfo";
import { LearningInfoPanel } from "@/features/learning-info/ui/LearningInfoPanel";
import { useSaved } from "@/features/saved/application/useSaved";
import { useVocabulary } from "@/features/vocabulary/application/useVocabulary";
import { VocabularyPanel } from "@/features/vocabulary/ui/VocabularyPanel";
import { ThreeAreaLayout } from "@/ui/layout/ThreeAreaLayout";

export default function ChatPage() {
  const chat = useChat();
  const feedback = useFeedback();
  const vocabulary = useVocabulary();
  const conversationList = useConversationList();
  const saved = useSaved();
  const learningInfo = useLearningInfo(
    chat.conversationId === NEW_CONVERSATION_SENTINEL
      ? null
      : chat.conversationId
  );
  const feedbackQuery = useFeedbackQuery();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const summary = useDailySummary(summaryOpen);

  const latestUserMessageId = useMemo(() => {
    if (chat.turns.length === 0) return null;
    return chat.turns[chat.turns.length - 1].user.id;
  }, [chat.turns]);

  const latestFeedbacks = useMemo(() => {
    if (!latestUserMessageId) return [];
    return feedback.feedbacksFor(latestUserMessageId);
  }, [feedback, latestUserMessageId]);

  // SavedItem(active, vocabulary) 우선 정렬 — B-2 노출 정책
  const sortedVocabulary = useMemo(() => {
    const list = [...vocabulary.entries];
    list.sort((a, b) => {
      const aSaved = saved.isSavedActive("vocabulary", a.id) ? 0 : 1;
      const bSaved = saved.isSavedActive("vocabulary", b.id) ? 0 : 1;
      if (aSaved !== bSaved) return aSaved - bSaved;
      return a.exposureCount - b.exposureCount;
    });
    return list;
  }, [saved, vocabulary.entries]);

  const activeFeedback = useMemo(() => {
    if (!feedbackQuery.activeFeedbackId) return null;
    for (const list of feedback.feedbacksByMessageId.values()) {
      const found = list.find((f) => f.id === feedbackQuery.activeFeedbackId);
      if (found) return found;
    }
    return null;
  }, [feedback.feedbacksByMessageId, feedbackQuery.activeFeedbackId]);

  const handleSend = async (content: string) => {
    const result = await chat.send(content);
    if (!result) return;
    void feedback.extractFor(result.conversationId, result.turn.user.id);
    void conversationList.refresh();
    void vocabulary.refresh();
    void saved.refresh();
    void learningInfo.refresh();
  };

  const handleSelectConversation = async (id: string) => {
    if (id === chat.conversationId) return;
    feedback.reset();
    feedbackQuery.reset();
    await chat.loadConversation(id);
  };

  const handleCreateNew = () => {
    feedback.reset();
    feedbackQuery.reset();
    chat.reset();
  };

  const activeId =
    chat.conversationId === NEW_CONVERSATION_SENTINEL ? null : chat.conversationId;

  return (
    <>
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
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-end border-b border-gray-200 bg-white px-3 py-1.5">
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                className="rounded border border-gray-300 px-2 py-0.5 text-[11px] hover:bg-gray-50"
              >
                📅 오늘 학습
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatView
                projectName={chat.projectName}
                turns={chat.turns}
                sending={chat.sending}
                error={chat.error}
                onSend={handleSend}
              />
            </div>
          </div>
        }
        right={
          <>
            <div className="h-1/2 overflow-hidden">
              <FeedbackPanel
                feedbacks={latestFeedbacks}
                extracting={feedback.extractingMessageId !== null}
                error={feedback.error}
                hasUserMessage={latestUserMessageId !== null}
                onAskQuestion={(fid) => feedbackQuery.openFor(fid)}
                emptyFallback={
                  latestUserMessageId === null && activeId !== null ? (
                    <LearningInfoPanel
                      info={learningInfo.info}
                      loading={learningInfo.loading}
                    />
                  ) : undefined
                }
              />
            </div>
            <div className="h-1/2 overflow-hidden">
              <VocabularyPanel
                entries={sortedVocabulary}
                loading={vocabulary.loading}
                error={vocabulary.error}
                onRefresh={() => void vocabulary.refresh()}
                onExpose={(id) => void vocabulary.markExposed(id)}
              />
            </div>
          </>
        }
      />

      <DailySummaryDrawer
        open={summaryOpen}
        date={summary.date}
        filter={summary.filter}
        summary={summary.summary}
        loading={summary.loading}
        error={summary.error}
        activeConversationId={activeId}
        getSaved={(type, refId) => saved.getByReference(type, refId)}
        onSave={(type, refId) => void saved.save(type, refId)}
        onMarkMastered={(id) => void saved.markMastered(id)}
        onMarkActive={(id) => void saved.markActive(id)}
        onDateChange={summary.setDate}
        onFilterChange={summary.setFilter}
        onClose={() => setSummaryOpen(false)}
      />

      <FeedbackQueryModal
        open={feedbackQuery.activeFeedbackId !== null}
        feedback={activeFeedback}
        session={feedbackQuery.session}
        pending={feedbackQuery.pending}
        error={feedbackQuery.error}
        onAsk={(q) => void feedbackQuery.ask(q)}
        onClose={() => void feedbackQuery.close()}
      />
    </>
  );
}
