import { unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';
import { PracticeText } from './lessonGen';

export type DbKind = 'consonant' | 'vowel' | 'syllable' | 'vocabulary' | 'sentence' | 'long_text';

async function fetchTexts(kind: DbKind): Promise<PracticeText[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('not configured');
  const { data, error } = await supabase
    .from('practice_texts')
    .select('level, text_korean, text_english, source')
    .eq('kind', kind)
    .order('level', { ascending: true })
    .order('source', { ascending: true })
    .order('text_korean', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

// kind 별 1시간 캐시 (인자가 캐시 키에 포함됨). 콘텐츠 재임포트 후 최대 1시간 내 반영.
const getTextsCached = unstable_cache(fetchTexts, ['practice-texts'], {
  revalidate: 3600,
  tags: ['practice-texts'],
});

/** practice_texts 조회 (결정적 순서). 미설정/오류 시 null — 호출부는 폴백 처리. */
export async function getTexts(kind: DbKind): Promise<PracticeText[] | null> {
  if (!getServiceClient()) return null; // 미설정 상태를 캐시에 남기지 않는다
  try {
    return await getTextsCached(kind);
  } catch {
    return null;
  }
}
