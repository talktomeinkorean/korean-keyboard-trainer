import { getTexts } from '@/lib/content/texts';
import { sanitizeTypable } from '@/lib/content/sanitize';
import { pickRandom } from '@/lib/game/words';
import type { RaceWord } from '@/lib/game/raceWord';

const RACE_WORD_COUNT = 10;

// 단어 풀은 빌드 산출물에 포함돼 있어 조회 비용이 없다. 요청마다 랜덤 10개만 뽑는다.
const POOL: RaceWord[] = getTexts('vocabulary')
  .map((t) => ({ korean: sanitizeTypable(t.text_korean), english: t.text_english }))
  .filter((w) => w.korean.length > 0);

export async function GET() {
  return Response.json({ words: pickRandom(POOL, RACE_WORD_COUNT) });
}
