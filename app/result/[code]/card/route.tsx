import { ImageResponse } from 'next/og';
import { decodeResultCode } from '@/lib/game/resultCode';
import { loadCardAssets, resultCardElement } from '@/lib/og/resultCard';
import { SITE_URL } from '@/lib/site';

/**
 * 저장·공유용 결과 카드 PNG. 결과 화면의 Save & Share 가 이걸 받아
 * 공유 시트에 파일로 넘기거나 내려받는다.
 *
 * OG 이미지(가로 1200x630)와 달리 카드만 세로로 담고, 이미지 하나만 남아도
 * 어디서 만든 건지 알 수 있게 도메인을 아래에 적는다.
 */
const CARD_HEIGHT = 1356; // 시안 452 의 3배
const SIZE = { width: 861, height: 1500 };

/** 이미지에 적을 주소 — 프로토콜은 뺀다 */
const DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

export async function GET(_request: Request, ctx: RouteContext<'/result/[code]/card'>) {
  const { code } = await ctx.params;
  const value = decodeResultCode(code);
  if (!value) {
    return new Response('Not Found', { status: 404 });
  }

  const { timeMs, keysPerMin } = value;
  const assets = await loadCardAssets();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          backgroundColor: '#36454d',
          // 게임 하늘색에서 결과 화면의 진한 색으로 — OG 이미지와 같은 계열
          backgroundImage: 'linear-gradient(180deg, #4d7f92 0%, #36454d 60%)',
        }}
      >
        {resultCardElement({ timeMs, keysPerMin, height: CARD_HEIGHT, assets })}

        <div
          style={{
            display: 'flex',
            fontFamily: 'DM Mono',
            fontSize: 26,
            color: '#dbe6ea',
          }}
        >
          {DOMAIN}
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: assets.fonts,
      // 코드만으로 결과가 정해지므로 영구 캐시해도 안전하다
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  );
}
