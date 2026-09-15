import type { ReactNode } from 'react';

/** Q&A 토글 화살표 — Figma `pinhead:pixel-arrow-down` (655:7969). */
function PixelArrowDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="currentColor">
      <path d="M15.4999 11.5H12.4999V13.5H11.4999V2.5H8.49992V13.5H7.49992V11.5H4.49992V13.5H6.49992V15.5H8.49992V17.5H11.4999V15.5H13.4999V13.5H15.4999V11.5Z" />
    </svg>
  );
}

/** 강조색 — 시안에서 날짜·당첨 조건 등에 쓰는 보라 두 가지 */
const PURPLE = 'text-[#8166ff]';
const PURPLE_SOFT = 'text-[#8d78f1]';

/** 목록의 상품명 — 굵게 밑줄 */
function Product({ children }: { children: string }) {
  return <strong className="font-bold underline [text-decoration-thickness:10%]">{children}</strong>;
}

const FAQ: { question: string; cardGap: string; answer: ReactNode }[] = [
  {
    question: 'What can I win?',
    cardGap: 'gap-[8px]',
    answer: (
      <>
        <p className={`leading-[1.5] ${PURPLE}`}>Choose one prize, worth up to $129</p>
        <ul className="list-disc leading-[1.5]">
          <li className="ms-[21px]">
            Korean <Product>Bootcamp</Product> for Beginners (6 weeks)
          </li>
          <li className="ms-[21px]">
            TTMIK <Product>Courses</Product> (6-month Subscription)
          </li>
          <li className="ms-[21px]">
            TTMIK <Product>Stories</Product> (6-month Subscription)
          </li>
          <li className="ms-[21px]">
            <Product>Seyo</Product> (6-month Subscription)
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "I'm slow. Can I still win?",
    cardGap: 'gap-[8px]',
    answer: (
      <>
        <p className="leading-[1.3]">Yes! It&apos;s not about being fast.</p>
        <p className="leading-[1.3]">
          We pick <span className={PURPLE_SOFT}>2 winners</span> at random from{' '}
          <span className={PURPLE_SOFT}>every rank</span>! (달팽이 🐌 to 타자왕 👑)
        </p>
        <p className="leading-[1.3]">Your time decides your rank, not your chance of winning 😉</p>
      </>
    ),
  },
  {
    question: 'How do I enter?',
    cardGap: 'gap-[12px]',
    answer: (
      <>
        <div className="leading-[1.3]">
          <p>1. Finish a race</p>
          <p>2. Tap &quot;Submit This Record&quot;</p>
          <p>3. Leave your name and email</p>
        </div>
        <p className="leading-[1.3]">
          Each record you save is one entry in the draw for that rank so play as many times as you like!
        </p>
        <p className={`leading-[1.3] ${PURPLE}`}>Oct 1 – Oct 11, 2026 (11:59 PM KST)</p>
      </>
    ),
  },
  {
    question: 'How do I know if I won?',
    cardGap: 'gap-[8px]',
    answer: (
      <p className="leading-[1.3]">
        We&apos;ll email every winner directly, with a short form to choose their prize 📬
        <br />
        <span className={PURPLE}>(Winners announced Oct 16, 2026)</span>
      </p>
    ),
  },
];

/**
 * 이벤트 Q&A. 홈은 전부 펼친 상태(1220:25353), 결과 화면은 전부 접힌 상태(1194:7784).
 * details 로 접고 펼 수 있게 한다.
 *
 * 항목 사이 간격이 상태마다 다르다 — 접힌 시안은 12px, 펼친 시안은 카드 뒤로 22px.
 * 그래서 항목 간격은 12px 로 두고 펼쳤을 때만 카드 아래 10px 를 더한다 (마지막 항목은 빼서
 * 전체 높이가 늘지 않게 한다).
 * 구분선은 details 밖에 둔다 — summary 가 details 의 첫 자식이어야 기본 "Details" 요약이 안 생긴다.
 */
export function Faq({ defaultOpen }: { defaultOpen: boolean }) {
  return (
    <div className="flex flex-col gap-[12px]">
      {FAQ.map(({ question, cardGap, answer }) => (
        <div key={question} className="group/item flex flex-col gap-[12px]">
          {/* 시안: 흰색 0.5px 점선(2px 선 · 2px 틈). 선은 자리를 차지하지 않고 위로 그려진다 —
              높이를 주면 네 줄에서 2px 가 밀린다 */}
          <div aria-hidden className="relative h-0 w-full">
            <div className="absolute inset-x-0 -top-[0.5px] h-[0.5px] bg-[repeating-linear-gradient(90deg,#fff_0_2px,transparent_2px_4px)]" />
          </div>
          <details open={defaultOpen} className="group">
            <summary className="flex cursor-pointer list-none items-center gap-[10px] [&::-webkit-details-marker]:hidden">
              {/* 접히면 오른쪽을 본다 — 시안의 pixel-arrow-right 는 이 화살표를 돌린 모양과 같다 */}
              <PixelArrowDown className="size-[20px] shrink-0 -rotate-90 text-[#8ceb97] transition-transform group-open:rotate-0" />
              <span className="font-dmsans text-[15px] font-bold leading-[1.5] text-white">{question}</span>
            </summary>
            <div
              className={`mt-[12px] mb-[10px] flex flex-col ${cardGap} rounded-[10px] bg-white p-[20px] font-dmsans text-[14px] text-black group-last/item:mb-0`}
            >
              {answer}
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}
