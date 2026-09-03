import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { decodeResultCode } from '@/lib/game/resultCode';
import { formatRaceTime, goalText, rankFor } from '@/lib/game/rank';

export const alt = 'My Hangeul Typing Race result';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 세로 카드(267x452)를 가로 캔버스 가운데 놓고, 양옆은 게임 배경으로 채운다.
 * 카드 안의 좌표는 앱과 같은 값에 이 배율만 곱한다.
 */
const CARD_HEIGHT = 520;
const CARD_WIDTH = Math.round((CARD_HEIGHT * 267) / 452);
const S = CARD_HEIGHT / 452;
/** 앱과 같은 px 값을 카드 배율로 옮긴다 */
const s = (px: number) => Math.round(px * S * 100) / 100;

/**
 * Satori 는 webp 를 못 읽어서 OG 전용 png 사본을 쓴다 (팔레트 축소로 용량을 줄였다).
 * 500KB 번들 한도가 있어 배경은 이미지 대신 그라디언트로 깐다.
 */
async function png(name: string): Promise<string> {
  const buf = await readFile(join(process.cwd(), 'assets', name));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function font(name: string) {
  return readFile(join(process.cwd(), 'assets', name));
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const value = decodeResultCode(code);
  if (!value) notFound();

  const { timeMs, keysPerMin } = value;
  const rank = rankFor(timeMs);

  const [card, photo, dmSans, dmSansBold, dmMono, notoKr] = await Promise.all([
    png('og-result-card.png'),
    png('og-result-photo.png'),
    font('DMSans-Medium.ttf'),
    font('DMSans-Bold.ttf'),
    font('DMMono-Medium.ttf'),
    font('NotoSansKR-Subset.ttf'),
  ]);

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
        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundImage: `url(${card})`,
            backgroundSize: `${CARD_WIDTH}px ${CARD_HEIGHT}px`,
          }}
        >
          {/* 폴라로이드 사진 */}
          <img
            src={photo}
            alt=""
            width={s(110.5)}
            height={s(109.5)}
            style={{ position: 'absolute', left: s(78), top: s(75.5) }}
          />

          {/* 등급 라벨 */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: s(191.8),
              width: CARD_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#36454d',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: s(4) }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: s(12) }}>{rank.emoji}</span>
              <span style={{ fontFamily: 'Noto Sans KR', fontSize: s(16) }}>{rank.korean}</span>
              <span style={{ fontFamily: 'DM Mono', fontSize: s(14) }}>{rank.romaja}</span>
            </div>
            <span style={{ fontFamily: 'DM Mono', fontSize: s(12), color: '#7d9fb2' }}>
              {rank.english}
            </span>
          </div>

          {/* 등급별 문구 */}
          <div
            style={{
              position: 'absolute',
              left: s(38.5),
              top: s(247.3),
              width: s(190),
              height: s(103.4),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontFamily: 'DM Sans',
              fontSize: s(14),
              lineHeight: 1.4,
              color: '#36454d',
            }}
          >
            {rank.message}
          </div>

          {/* 기록 */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: s(386),
              width: CARD_WIDTH,
              height: s(36),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(10),
              color: '#36454d',
            }}
          >
            <span style={{ fontFamily: 'DM Mono', fontSize: s(20) }}>{formatRaceTime(timeMs)}</span>
            <div style={{ display: 'flex', width: 1, height: s(11.5), backgroundColor: '#36454d' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: s(4) }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: s(20) }}>{keysPerMin}</span>
              <span style={{ fontFamily: 'DM Sans', fontSize: s(12), color: '#6b8999' }}>
                keys/min
              </span>
            </div>
          </div>
        </div>

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
    {
      ...size,
      fonts: [
        { name: 'DM Sans', data: dmSans, style: 'normal', weight: 500 },
        { name: 'DM Sans', data: dmSansBold, style: 'normal', weight: 700 },
        { name: 'DM Mono', data: dmMono, style: 'normal', weight: 400 },
        { name: 'Noto Sans KR', data: notoKr, style: 'normal', weight: 500 },
      ],
    },
  );
}
