/**
 * 시안의 초록 픽셀 버튼 스타일 (Game Start, 나가기 팝업 등 공용).
 * 위/아래 안쪽 그림자로 눌리는 느낌을 낸다.
 */
export const PIXEL_BUTTON_BASE =
  'flex items-center justify-center rounded-[2px] border border-[#36454d] ' +
  'font-dmmono text-[15px] text-[#36454d] ' +
  'shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.5)] ' +
  'transition active:translate-y-px hover:brightness-105';

/** 기본형 — 40px 높이의 연두색 버튼. 높이·색이 다른 버튼은 BASE 에 직접 얹는다. */
export const PIXEL_BUTTON = `${PIXEL_BUTTON_BASE} h-[40px] bg-[#8ceb97]`;
