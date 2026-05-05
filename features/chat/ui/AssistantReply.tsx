/**
 * features/chat/ui/AssistantReply — assistant 몰입형 번역 응답 렌더.
 *
 * 4-layer: UI
 * 역할: Component (Dumb)
 * 의존성 방향:
 *   - import 가능: react, features/chat/domain
 *   - import 금지: application/atoms, infrastructure
 * 기술 선택:
 *   - 한 sentence_pair = 영어 1줄 + 한국어 1줄. 학습 노출 최대화.
 *   - highlighted_words는 영어 문장에서 해당 토큰을 강조.
 *     단순 substring 매칭(첫 등장만, case-sensitive). 정밀 토크나이저는 후속.
 *   - reason별 색상 분리: feedback=주황, vocab_gap=파랑.
 */

import type {
  HighlightedWord,
  Reply,
  SentencePair,
} from "@/features/chat/domain/model";

type Props = {
  reply: Reply;
};

function highlightClass(reason: HighlightedWord["reason"]): string {
  if (reason === "feedback") return "bg-orange-100 text-orange-900 font-semibold";
  return "bg-blue-100 text-blue-900 font-semibold";
}

function renderHighlighted(
  text: string,
  highlights: readonly HighlightedWord[]
): React.ReactNode {
  if (highlights.length === 0) return text;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const hw of highlights) {
    if (!hw.text) continue;
    const idx = text.indexOf(hw.text, cursor);
    if (idx < 0) continue;
    if (idx > cursor) nodes.push(text.slice(cursor, idx));
    nodes.push(
      <span key={`${idx}-${hw.text}`} className={`rounded px-0.5 ${highlightClass(hw.reason)}`}>
        {hw.text}
      </span>
    );
    cursor = idx + hw.text.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function PairRow({ pair }: { pair: SentencePair }) {
  return (
    <div className="space-y-0.5">
      <div className="text-sm leading-relaxed">
        {renderHighlighted(pair.english, pair.highlightedWords)}
      </div>
      <div className="text-xs leading-relaxed opacity-60">{pair.korean}</div>
    </div>
  );
}

export function AssistantReply({ reply }: Props) {
  if (reply.sentencePairs.length === 0) {
    return (
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2 text-xs italic opacity-60">
        (응답이 비어있습니다)
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-2 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
        {reply.sentencePairs.map((pair, i) => (
          <PairRow key={i} pair={pair} />
        ))}
      </div>
    </div>
  );
}
