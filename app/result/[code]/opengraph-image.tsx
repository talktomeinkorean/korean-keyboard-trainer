import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { decodeResultCode } from '@/lib/game/resultCode';
import { goalText } from '@/lib/game/rank';
import { loadCardAssets, resultCardElement } from '@/lib/og/resultCard';

export const alt = 'My Hangeul Typing Race result';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** 세로 카드(267x452)를 가로 캔버스 가운데 놓고, 양옆은 게임 배경으로 채운다. */
const CARD_HEIGHT = 520;

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const value = decodeResultCode(code);
  if (!value) notFound();

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
          gap: 16,
          backgroundColor: '#36454d',
          // 게임 하늘색에서 결과 화면의 진한 색으로 — 앱과 같은 계열
          backgroundImage: 'linear-gradient(180deg, #4d7f92 0%, #36454d 60%)',
        }}
      >
        {resultCardElement({ timeMs, keysPerMin, height: CARD_HEIGHT, assets })}

        {/* 카드 아래 목표 문구 */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'DM Sans',
            fontWeight: 700,
            fontSize: 22,
            color: '#ffffff',
          }}
        >
          {goalText(timeMs)}
        </div>
      </div>
    ),
    { ...size, fonts: assets.fonts },
  );
}
