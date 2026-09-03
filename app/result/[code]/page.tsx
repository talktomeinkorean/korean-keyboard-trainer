import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResultCard } from '@/components/game/ResultCard';
import { PIXEL_BUTTON, PIXEL_BUTTON_BASE } from '@/components/game/pixelButton';
import { decodeResultCode } from '@/lib/game/resultCode';
import { formatRaceTime, rankFor } from '@/lib/game/rank';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const value = decodeResultCode(code);
  if (!value) return { title: 'Hangeul Typing Race' };

  const rank = rankFor(value.timeMs);
  return {
    title: `${formatRaceTime(value.timeMs)} · ${rank.emoji} ${rank.korean} (${rank.english}) — Hangeul Typing Race`,
    description: `${rank.message} Type Korean words and race across Seoul.`,
    // 공유 링크마다 페이지가 생기지만 색인 대상은 아니다
    robots: { index: false, follow: true },
  };
}

/** 공유 링크가 열리는 화면. 기록을 보여주고 직접 해보도록 유도한다. */
export default async function ResultPage({ params }: Props) {
  const { code } = await params;
  const value = decodeResultCode(code);
  if (!value) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center gap-[20px] bg-[#36454d] px-4 pt-[50px] pb-[40px]">
      <ResultCard timeMs={value.timeMs} keysPerMin={value.keysPerMin} />
      <Link href="/race" className={`${PIXEL_BUTTON} w-[265px] max-w-full`}>
        Try It Yourself
      </Link>
      <Link
        href="/lessons"
        className={`${PIXEL_BUTTON_BASE} h-[40px] w-[265px] max-w-full bg-[#ab99ff]`}
      >
        Practice Typing
      </Link>
    </main>
  );
}
