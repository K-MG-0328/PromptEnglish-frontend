/**
 * ui/layout/ThreeAreaLayout — 데스크탑/iPad 3 영역 레이아웃 셸.
 *
 * 4-layer: UI (공통 layout)
 * 역할: Component (Dumb composer — slot props로 자식을 받아 배치)
 * 의존성 방향:
 *   - import 가능: react
 *   - import 금지: features/*, application, infrastructure
 * 기술 선택:
 *   - 좌(대화 목록) / 중(메인 대화) / 우(피드백 + 학습 정보) 3 영역.
 *     OKR §화면 결정 (1.2 KR — 데스크탑/iPad 정상 동작).
 *   - md 미만 화면에선 stack(세로)로 fallback. 본격 모바일은 후속 PR.
 *   - 영역별 ResizeObserver는 도입 안 함 — 고정 grid 컬럼 비율(1fr 2.5fr 1.2fr).
 */

import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
};

export function ThreeAreaLayout({ left, center, right }: Props) {
  return (
    <div className="grid h-screen w-screen grid-cols-1 grid-rows-[auto_1fr_auto] gap-0 md:grid-cols-[16rem_1fr_22rem] md:grid-rows-1">
      <div className="hidden md:block md:h-screen md:overflow-hidden">{left}</div>
      <div className="h-full overflow-hidden">{center}</div>
      <div className="hidden md:flex md:h-screen md:flex-col md:overflow-hidden md:divide-y md:divide-gray-200">
        {right}
      </div>
    </div>
  );
}
