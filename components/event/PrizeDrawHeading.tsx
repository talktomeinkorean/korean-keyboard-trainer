/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */

/** 시안 트로피 박스(홈 기준)와 에셋에 포함된 흰 바깥 테두리 두께 */
const TROPHY = { width: 27.972, height: 25.175, outline: 3.467, assetWidth: 35, assetHeight: 33 };

interface Props {
  /** 앵커 id — 홈의 "See prizes & rules" 가 여기로 스크롤한다 */
  id?: string;
  /** 트로피 배율. 결과 화면 시안(1278:7092)은 홈보다 18% 크다 (33.05x29.74) */
  trophyScale?: number;
}

/**
 * 이벤트 안내 — Q&A 위에 놓이는 트로피와 제목·기간 (홈 1220:25047, 결과 화면 1278:7091).
 *
 * 레이아웃은 시안의 트로피 박스로 잡고, 흰 바깥 테두리가 포함된 에셋은 그만큼 바깥으로
 * 삐져나오게 둔다 — 그래야 아래 글자와의 간격 20px 가 시안과 맞는다.
 * 시안의 20px 는 트로피와 글자 사이다. 제목과 기간은 붙어 있다.
 */
export function PrizeDrawHeading({ id, trophyScale = 1 }: Props) {
  const k = trophyScale;
  return (
    <div id={id} className="flex scroll-mt-4 flex-col items-center gap-[20px] text-center">
      <div
        className="relative shrink-0"
        style={{ width: TROPHY.width * k, height: TROPHY.height * k }}
      >
        <img
          src="/home/icon-trophy.svg"
          alt=""
          aria-hidden
          className="absolute max-w-none"
          style={{
            left: -TROPHY.outline * k,
            top: -TROPHY.outline * k,
            width: TROPHY.assetWidth * k,
            height: TROPHY.assetHeight * k,
          }}
        />
      </div>
      <div>
        <p className="font-dmsans text-[24.85px] font-extrabold leading-[1.5] text-white">
          Hangeul Day Prize Draw
        </p>
        <p className="font-dmsans text-[22px] font-medium leading-[1.5] text-[#f9f064]">
          Oct 1 – Oct 11, 2026
        </p>
      </div>
    </div>
  );
}
