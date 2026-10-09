/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아트라 최적화 파이프라인이 필요 없다. */
'use client';

import { useEffect, useState } from 'react';

/** "Don't show again" 을 고르면 남기는 값 */
export const HIDE_KEY = 'htt.eventEndedNotice';

/**
 * 이번 방문에서 이미 닫았는지. 연습을 하다 목록(/)으로 돌아올 때마다 다시 뜨지 않게 한다.
 * 모듈 변수라 새로고침하거나 다시 들어오면 풀린다 — 그때는 다시 보여 주는 게 맞다.
 */
let closedThisVisit = false;

const CHECKBOX_ICON = { on: '/race/checkbox-on.svg', off: '/race/checkbox-off.svg' } as const;

/** 시안의 숫자는 "123,456+" 처럼 끝에 + 를 작게 붙인다. 숫자를 못 읽었으면 "-" 만 둔다. */
function RaceCount({ count }: { count: number | null }) {
  if (count === null) return <span className="text-[30.061px]">-</span>;
  return (
    <>
      <span className="text-[30.061px]">{count.toLocaleString('en-US')}</span>
      <span className="text-[20px]">+</span>
    </>
  );
}

/**
 * 이벤트 종료 공지 (시안 1857:13937). 타자연습 목록(/)에 들어오면 한 번 뜬다.
 *
 * 열지 말지는 브라우저에서만 정한다 — 서버는 localStorage 를 볼 수 없어서, 서버에서 그리면
 * "다시 보지 않기" 를 고른 사람에게도 한 번 번쩍인다.
 *
 * 좌표는 카드(320) 바깥 테두리 기준인 시안 값에서 테두리 1px 을 뺀 것이다.
 */
export function EventEndedPopup({ races }: { races: number | null }) {
  const [open, setOpen] = useState(false);
  const [hideForever, setHideForever] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = localStorage.getItem(HIDE_KEY) === 'hidden';
    } catch {
      // 저장소가 막힌 브라우저 — 매번 보여 준다
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage 는 브라우저에서만 읽을 수 있다
    if (!hidden && !closedThisVisit) setOpen(true);
  }, []);

  function close() {
    if (hideForever) {
      try {
        localStorage.setItem(HIDE_KEY, 'hidden');
      } catch {
        // 저장이 안 되면 다음 방문에 다시 뜰 뿐이다
      }
    }
    closedThisVisit = true;
    setOpen(false);
  }

  // Esc 로도 닫는다. 카드 안 빈 곳을 눌러 포커스가 버튼을 떠나도 잡히도록 창에 건다.
  // 의존성을 두지 않아 매 렌더 다시 거는데, 그래야 체크 상태가 바뀐 close 를 쓴다 (렌더는 몇 번 안 된다).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!open) return null;

  return (
    <div
      data-testid="event-ended-popup"
      className="fixed inset-0 z-[60] overflow-y-auto bg-[#36454d]/50 backdrop-blur-[5px]"
    >
      {/* 카드(680)가 화면보다 길면 잘리지 않고 스크롤되게 한다.
          카드 바깥(배경)을 눌러도 닫힌다 — 카드 안을 누른 것은 무시한다. */}
      <div
        data-testid="event-ended-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="flex min-h-full items-center justify-center p-4"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-ended-title"
          className="relative w-[320px] max-w-full rounded-[2px] border border-[#36454d] bg-[linear-gradient(180deg,#f9f395_0%,#ffffff_56.6%)] px-[39px] pt-[48.64px] pb-[32.64px]"
        >
          {/* 말풍선 왼쪽 캐릭터 — 레이스 스프라이트의 첫 프레임 (시안 run-01). 시안처럼 말풍선 위에 올린다 */}
          <div
            aria-hidden
            className="absolute left-[42.36px] top-[209.73px] z-10 size-[53.3px] bg-no-repeat"
            style={{
              backgroundImage: 'url(/race/run_sheet.webp)',
              backgroundSize: '213.2px 53.3px',
            }}
          />
          {/* 말풍선 오른쪽 위 게임패드 — 홈 Play Now 버튼의 것과 같은 그림 */}
          <img
            src="/home/icon-gift-right.svg"
            alt=""
            aria-hidden
            className="absolute left-[230.79px] top-[178.67px] z-10 h-[24.14px] w-[27.62px]"
          />

          <div className="flex flex-col items-center gap-[40px]">
            <div className="flex flex-col gap-[35px]">
              <div className="relative flex flex-col items-center gap-[40px]">
                {/* 말풍선 뒤 연두 빛번짐 — 시안은 가운데가 아니라 왼쪽으로 조금 치우쳐 있다 */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-[2.31px] top-[131.05px] h-[142.72px] w-[224.84px]"
                >
                  {/* 흐림이 번질 자리만큼 상자보다 크게 깐다 (시안 그대로) */}
                  <div className="absolute inset-[-18.51%_-9.56%]">
                    <img src="/notice/glow.svg" alt="" className="block size-full max-w-none" />
                  </div>
                </div>

                <div className="relative flex flex-col items-center gap-[8px]">
                  {/* 결과 화면의 깃발과 같은 그림. 시안은 뒤에 흰 깃발 모양을 깔아
                      체크무늬 빈칸을 흰색으로 채운다 — 그대로 두면 노란 배경이 비친다. */}
                  <span aria-hidden className="relative size-[30px]">
                    <svg
                      viewBox="0 0 20.0864 15.3605"
                      className="absolute left-[4.7px] top-[6.35px] h-[15.36px] w-[20.086px]"
                    >
                      <path
                        d="M0 15.3605V1.40345L8.24031 1.0228L9.0765 0H17.8565L20.0864 1.16327V12.3822L18.9714 13.8687H10.865L9.56158 15.3605H0Z"
                        fill="white"
                      />
                    </svg>
                    <img
                      src="/lessons/result/flag.png"
                      alt=""
                      className="absolute left-[-10.18px] top-[-10.3px] size-[50.087px] max-w-none"
                    />
                  </span>
                  <h2
                    id="event-ended-title"
                    className="text-center font-dmsans text-[20px] font-extrabold leading-[1.3] text-[#36454d]"
                  >
                    The Hangeul Day
                    <br />
                    Prize Draw has ended!
                  </h2>
                </div>

                <div className="relative flex flex-col items-center gap-[15px]">
                  <div className="relative h-[81.72px] w-[179.93px]">
                    <img
                      src="/notice/bubble.svg"
                      alt=""
                      aria-hidden
                      className="absolute left-0 top-0 h-[73.25px] w-[179.93px] max-w-none"
                    />
                    {/* 시안은 이 글자색이 투명(alpha 0)이라 보이지 않는다 — 홈 숫자와 같은 색으로 둔다 */}
                    <p
                      data-testid="event-ended-races"
                      className="absolute left-[89.71px] top-[31.64px] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-silkscreen leading-[1.3] tracking-[-3.0061px] text-[#36454d] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
                    >
                      <RaceCount count={races} />
                    </p>
                    <p className="absolute left-[154.49px] top-[64.72px] -translate-x-1/2 whitespace-nowrap font-dmsans text-[14px] font-semibold leading-[1.2] text-[#6b8999]">
                      races
                    </p>
                  </div>
                  <p className="text-center font-dmsans text-[15px] font-semibold leading-[1.4] text-[#8166ff]">
                    Thank you so much
                    <br />
                    for racing across Seoul with us
                  </p>
                </div>
              </div>

              {/* 시안의 글상자는 260 으로 칸(240)보다 넓다 — 줄바꿈 위치가 그 폭 기준이라 그대로 둔다 */}
              <div className="flex flex-col gap-[15px] whitespace-pre-wrap font-dmsans text-[14px] leading-[1.5] text-black">
                <p className="w-[260px] font-semibold">
                  {'🎁  '}
                  <span className="font-normal">Winners will be announced</span>
                  <br />
                  <span className="font-normal">on</span>
                  <span className="font-bold"> Oct 16 (KST</span>)
                  <br />
                  We’ll email each winner directly,
                  <br />
                  so keep an eye on your inbox
                  <br />
                  (and spam folder, just in case)!
                </p>
                <p className="w-[260px]">
                  {'⌨  Hangeul Typing is here to stay'}
                  <br />
                  We’ll keep adding new features and updates, so come back anytime!
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-[10px]">
              <button
                type="button"
                onClick={close}
                autoFocus
                className="flex h-[40px] w-[200px] items-center justify-center rounded-[2px] border border-[#36454d] bg-[#8ceb97] font-dmmono text-[15px] font-medium text-[#36454d] shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.5)] transition active:translate-y-px hover:brightness-105"
              >
                Practice Typing
              </button>
              <label className="flex cursor-pointer items-start gap-[10px]">
                <input
                  type="checkbox"
                  data-testid="event-ended-hide"
                  checked={hideForever}
                  onChange={(e) => setHideForever(e.target.checked)}
                  style={{
                    backgroundImage: `url(${hideForever ? CHECKBOX_ICON.on : CHECKBOX_ICON.off})`,
                  }}
                  className="size-[20px] shrink-0 cursor-pointer appearance-none bg-contain bg-center bg-no-repeat"
                />
                <span className="font-dmsans text-[14px] leading-[1.4] text-[#6b8999]">
                  Don’t show again
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
