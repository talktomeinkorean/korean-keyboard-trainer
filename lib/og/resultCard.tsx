/* eslint-disable @next/next/no-img-element -- Satori(next/og)는 next/image 가 아니라 순수 <img> 만 이해한다. */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatRaceTime, rankFor } from '@/lib/game/rank';

/**
 * 결과 카드를 이미지로 그리는 부분 — OG 이미지(가로 캔버스)와 저장용 카드(세로)가
 * 같은 그림을 써야 해서 여기 한 곳에 둔다. 서버 전용(next/og · node:fs).
 *
 * 카드 시안은 267x452 이고, 아래 좌표는 전부 그 기준이다. 높이만 주면 배율을 곱해 그린다.
 */
export const CARD_W = 267;
export const CARD_H = 452;

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

export interface CardAssets {
  card: string;
  photo: string;
  fonts: {
    name: string;
    data: Buffer;
    style: 'normal';
    weight: 400 | 500 | 700;
  }[];
}

export async function loadCardAssets(): Promise<CardAssets> {
  const [card, photo, dmSans, dmSansBold, dmMono, notoKr, vt323] = await Promise.all([
    png('og-result-card.png'),
    png('og-result-photo.png'),
    font('DMSans-Medium.ttf'),
    font('DMSans-Bold.ttf'),
    font('DMMono-Medium.ttf'),
    font('NotoSansKR-Subset.ttf'),
    font('VT323-Regular.ttf'),
  ]);

  return {
    card,
    photo,
    fonts: [
      { name: 'DM Sans', data: dmSans, style: 'normal', weight: 500 },
      { name: 'DM Sans', data: dmSansBold, style: 'normal', weight: 700 },
      { name: 'DM Mono', data: dmMono, style: 'normal', weight: 400 },
      { name: 'Noto Sans KR', data: notoKr, style: 'normal', weight: 500 },
      { name: 'VT323', data: vt323, style: 'normal', weight: 400 },
    ],
  };
}

interface CardProps {
  timeMs: number;
  keysPerMin: number;
  /** 그릴 카드 높이(px). 시안 452 기준으로 배율이 정해진다. */
  height: number;
  assets: CardAssets;
}

/** 결과 카드 한 장. 앱 화면의 ResultCard 와 같은 좌표를 배율만 바꿔 쓴다. */
export function resultCardElement({ timeMs, keysPerMin, height, assets }: CardProps) {
  const width = Math.round((height * CARD_W) / CARD_H);
  const scale = height / CARD_H;
  /** 앱과 같은 px 값을 카드 배율로 옮긴다 */
  const s = (px: number) => Math.round(px * scale * 100) / 100;
  const rank = rankFor(timeMs);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width,
        height,
        backgroundImage: `url(${assets.card})`,
        backgroundSize: `${width}px ${height}px`,
      }}
    >
      {/* 폴라로이드 사진 */}
      <img
        src={assets.photo}
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
          width,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#36454d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: s(4) }}>
          <span style={{ fontFamily: 'Noto Sans KR', fontSize: s(16) }}>{rank.korean}</span>
          <span style={{ fontFamily: 'DM Mono', fontSize: s(14) }}>{rank.romaja}</span>
        </div>
        {/* 이모지는 아랫줄 영어 이름 앞에 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: s(4),
            fontFamily: 'DM Mono',
            fontSize: s(12),
            color: '#7d9fb2',
          }}
        >
          <span>{rank.emoji}</span>
          <span>{rank.english}</span>
        </div>
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
          width,
          height: s(36),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: s(10),
          color: '#36454d',
        }}
      >
        <span style={{ fontFamily: 'VT323', fontSize: s(20) }}>{formatRaceTime(timeMs)}</span>
        <div style={{ display: 'flex', width: 1, height: s(11.5), backgroundColor: '#36454d' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: s(4) }}>
          <span style={{ fontFamily: 'VT323', fontSize: s(20) }}>{keysPerMin}</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: s(12), color: '#6b8999' }}>keys/min</span>
        </div>
      </div>
    </div>
  );
}
