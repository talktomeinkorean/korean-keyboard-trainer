import { RaceGame } from '../RaceGame';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Play the Hangeul Typing Race — Korean Typing Game',
  description:
    'Type 10 Korean words as fast as you can and find out your rank, from 달팽이 (snail) to 타자왕 (typing king).',
  path: '/race',
});

export default function RacePage() {
  return <RaceGame />;
}
