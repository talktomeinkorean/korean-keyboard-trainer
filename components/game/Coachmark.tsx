'use client';

import { useEffect } from 'react';

/** 시안 안내 오버레이 — 폰용(393x850)과 PC용(1920x1080)을 2x 로 내보낸 것 */
const MOBILE_SRC = '/race/coachmark-mobile.webp';
const DESKTOP_SRC = '/race/coachmark-desktop.webp';

const ALT =
  'Type the word shown. The letter chips are a hint if you need it. To start, tap the first letter or press it on your keyboard.';

interface Props {
  onClose: () => void;
}

/**
 * 첫 판 시작 직후 한 번만 뜨는 조작 안내.
 *
 * 이미지 안에 카드·키보드 그림이 함께 들어 있어(시안 그대로) 실제 화면 위에 덮어 쓴다.
 * 어두운 막(#36454D, 70%)은 이미지에서 빼고 CSS 로 깐다 — 진하기를 코드에서 조절할 수 있다.
 * 화면 비율이 시안과 달라도 잘리기만 하도록 cover 로 채운다.
 */
export function Coachmark({ onClose }: Props) {
  // 안내가 떠 있는 동안 뒤 화면이 스크롤되면 고정된 안내와 어긋나 보인다 — 잠가 둔다.
  // 이 앱은 html 이 스크롤 주체라 body 만 막으면 소용이 없어 둘 다 막는다.
  useEffect(() => {
    const root = document.documentElement;
    const previous = { root: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous.root;
      document.body.style.overflow = previous.body;
    };
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close the guide"
      data-testid="coachmark"
      onClick={onClose}
      onKeyDown={(e) => {
        // 스페이스·엔터는 물론 게임 키를 눌러도 안내를 닫는다 (바로 치고 싶은 사람)
        e.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-[70] touch-none overscroll-contain cursor-pointer bg-[#36454DB2]"
    >
      <picture>
        <source media="(min-width: 640px)" srcSet={DESKTOP_SRC} />
        <img src={MOBILE_SRC} alt={ALT} className="h-full w-full object-cover" />
      </picture>
      <p className="pointer-events-none absolute inset-x-0 bottom-[24px] text-center font-dmmono text-[13px] text-[#8ceb97]">
        Tap anywhere to continue
      </p>
    </div>
  );
}
