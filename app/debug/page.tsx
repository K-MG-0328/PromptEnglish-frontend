/**
 * /debug — M2~M4 백엔드 동작 검증용 디버그 페이지 1장.
 *
 * 4-layer: 일시적 prototype (M5 본격 features/ 도입 전).
 * features/ 구조는 만들지 않는다. M5에 features/chat/feedback/vocabulary 분리 시
 * 이 파일은 삭제 또는 단순 진입점으로 축소.
 */
"use client";

import { useEffect, useState } from "react";

import { httpClient, HttpError } from "@/infrastructure/http/httpClient";

type BaseResponse<T> = { success: boolean; message: string; data: T };

type SentencePair = {
  english: string;
  korean: string;
  highlighted_words: { text: string; reason: string }[];
};

type ReplyDto = {
  sentence_pairs: SentencePair[];
  generated_at: string;
};

type MessageDto = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  reply: ReplyDto | null;
};

type PostMessageData = {
  conversation_id: string;
  project_name: string;
  user_message: MessageDto;
  assistant_message: MessageDto | null;
};

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

type VocabularyEntryDto = {
  id: string;
  korean: string;
  english: string;
  exposure_count: number;
  created_at: string;
  last_exposed_at: string | null;
  source_conversation_id: string | null;
};

function formatErr(err: unknown): string {
  if (err instanceof HttpError) {
    return `HTTP ${err.status}: ${JSON.stringify(err.body)}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function DebugPage() {
  const [conversationId, setConversationId] = useState("_");
  const [content, setContent] = useState("");
  const [postResult, setPostResult] = useState<PostMessageData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackDto[] | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyEntryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setError(null);
    setLoading(true);
    try {
      const res = await httpClient<BaseResponse<PostMessageData>>(
        `/conversations/${encodeURIComponent(conversationId)}/messages`,
        { method: "POST", body: JSON.stringify({ content }) }
      );
      setPostResult(res.data);
      // 다음 호출이 같은 conversation에 attach되도록
      setConversationId(res.data.conversation_id);
      setFeedback(null);
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleExtractFeedback() {
    if (!postResult) return;
    setError(null);
    setLoading(true);
    try {
      const res = await httpClient<BaseResponse<FeedbackDto[]>>(`/feedback/extract`, {
        method: "POST",
        body: JSON.stringify({
          conversation_id: postResult.conversation_id,
          message_id: postResult.user_message.id,
        }),
      });
      setFeedback(res.data);
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadVocabulary() {
    setError(null);
    try {
      const res = await httpClient<BaseResponse<VocabularyEntryDto[]>>(
        `/vocabulary?limit=20`
      );
      setVocabulary(res.data);
    } catch (err) {
      setError(formatErr(err));
    }
  }

  useEffect(() => {
    let cancelled = false;
    httpClient<BaseResponse<VocabularyEntryDto[]>>(`/vocabulary?limit=20`)
      .then((res) => {
        if (!cancelled) setVocabulary(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(formatErr(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">PromptEnglish — Debug</h1>
      <p className="text-sm opacity-70">
        M2~M4 백엔드 검증용. 본격 UI는 M5에 features/ 분리 도입.
      </p>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-semibold">메시지 송신 (POST /conversations/{`{id}`}/messages)</h2>
        <label className="block text-sm">
          conversation_id (신규는 <code>_</code>)
          <input
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="mt-1 block w-full rounded border px-2 py-1 font-mono text-xs"
          />
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메시지를 입력... (예: 의제 영어로 뭐야?)"
          rows={3}
          className="block w-full rounded border px-2 py-1 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={loading || !content.trim()}
          className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          {loading ? "..." : "Send"}
        </button>
      </section>

      {error && (
        <section className="rounded border border-red-400 bg-red-50 p-4 text-sm text-red-900">
          <pre className="whitespace-pre-wrap">{error}</pre>
        </section>
      )}

      {postResult && (
        <section className="rounded border p-4 space-y-3">
          <h2 className="font-semibold">Reply ({postResult.project_name})</h2>
          {postResult.assistant_message?.reply ? (
            <div className="space-y-2">
              {postResult.assistant_message.reply.sentence_pairs.map((sp, i) => (
                <div key={i} className="rounded bg-gray-50 p-2">
                  <div className="text-sm">{sp.english}</div>
                  <div className="text-xs opacity-70">{sp.korean}</div>
                  {sp.highlighted_words.length > 0 && (
                    <div className="mt-1 text-xs">
                      highlighted:{" "}
                      {sp.highlighted_words.map((hw, j) => (
                        <span key={j} className="mr-2 font-mono">
                          {hw.text}({hw.reason})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm opacity-50">(reply 생성 실패 또는 미생성)</div>
          )}
          <button
            onClick={handleExtractFeedback}
            disabled={loading}
            className="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {loading ? "..." : "Extract Feedback"}
          </button>
          <details className="text-xs">
            <summary className="cursor-pointer">raw JSON</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2">
              {JSON.stringify(postResult, null, 2)}
            </pre>
          </details>
        </section>
      )}

      {feedback && (
        <section className="rounded border p-4 space-y-2">
          <h2 className="font-semibold">Feedback ({feedback.length}건)</h2>
          {feedback.length === 0 ? (
            <div className="text-sm opacity-50">없음</div>
          ) : (
            feedback.map((fb) => (
              <div key={fb.id} className="rounded bg-yellow-50 p-2 text-sm">
                <div>
                  <span className="font-mono text-xs">[{fb.category}/{fb.severity}]</span>{" "}
                  <s>{fb.original}</s> → <strong>{fb.suggestion}</strong>
                </div>
                <div className="text-xs opacity-70">{fb.explanation}</div>
              </div>
            ))
          )}
        </section>
      )}

      <section className="rounded border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">VocabularyDB (least exposed)</h2>
          <button
            onClick={loadVocabulary}
            className="text-xs underline"
          >
            refresh
          </button>
        </div>
        {vocabulary?.length ? (
          <ul className="space-y-1 text-sm">
            {vocabulary.map((v) => (
              <li key={v.id} className="font-mono">
                {v.korean} → {v.english}{" "}
                <span className="text-xs opacity-50">(exp:{v.exposure_count})</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm opacity-50">없음</div>
        )}
      </section>
    </div>
  );
}
