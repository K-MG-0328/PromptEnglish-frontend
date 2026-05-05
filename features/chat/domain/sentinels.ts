/**
 * features/chat/domain/sentinels — 도메인 sentinel 상수.
 *
 * 4-layer: Domain
 * 역할: Type Definition (도메인 불변 상수)
 * 의존성 방향:
 *   - import 가능: 없음
 *   - import 금지: infrastructure, application, ui
 * 기술 선택:
 *   - BE PostMessageUseCase의 NEW_CONVERSATION_SENTINEL과 동일 값 ("_").
 *     BE 도메인 결정이 변하면 여기도 함께 변경 (양쪽이 같은 약속을 공유).
 */

export const NEW_CONVERSATION_SENTINEL = "_";
