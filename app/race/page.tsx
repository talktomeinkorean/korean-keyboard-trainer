import { RaceGame } from '../RaceGame';
import { pageMetadata } from '@/lib/seo';

// 문구는 마케팅팀 SEO 요청서(2026-11-16) 작업 1 확정안이다.
export const metadata = pageMetadata({
  title: 'Race Across Seoul | Hangeul Typing',
  description:
    'Type 10 Korean words as fast as you can and reach the finish line. Use your keyboard or tap the keys on screen.',
  path: '/race',
});

export default function RacePage() {
  return <RaceGame />;
}
