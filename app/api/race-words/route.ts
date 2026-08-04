import { getTexts } from '@/lib/content/db';
import { sanitizeTypable } from '@/lib/content/sanitize';
import { pickRandom } from '@/lib/game/words';

const RACE_WORD_COUNT = 5;

// 단어 풀은 getTexts 가 1시간 캐시 — 요청마다 랜덤 5개만 새로 뽑는다 (응답은 캐시 안 함)
export async function GET() {
  const texts = await getTexts('vocabulary');
  if (!texts) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }
  const pool = texts.map((t) => sanitizeTypable(t.text_korean)).filter(Boolean);
  return Response.json({ words: pickRandom(pool, RACE_WORD_COUNT) });
}
