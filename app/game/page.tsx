import { HomeScreen } from './HomeScreen';
import { pageMetadata } from '@/lib/seo';
import { getRunnerCount } from '@/lib/finishes/stats';

// 참여인원 숫자 때문에 1분마다 다시 만든다. 페이지 자체는 정적이라 방문자마다 DB 를 부르지 않는다.
export const revalidate = 60;

// 문구는 마케팅팀 SEO 요청서(2026-11-16) 작업 1 확정안이다.
export const metadata = pageMetadata({
  title: 'Korean Typing Game: Race Across Seoul | Hangeul Typing',
  description:
    'Type Korean words to race across Seoul in this free Korean typing game. Check your time, get your rank from snail to typing king, and challenge friends.',
  path: '/game',
});

export default async function Home() {
  return <HomeScreen runnerCount={await getRunnerCount()} />;
}
