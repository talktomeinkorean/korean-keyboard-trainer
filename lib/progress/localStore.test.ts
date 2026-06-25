import { describe, it, expect, beforeEach } from 'vitest';
import { LocalProgressStore } from './localStore';

describe('LocalProgressStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('userId 를 발급하고 같은 값을 반복 반환한다', async () => {
    const store = new LocalProgressStore();
    const id1 = await store.getUserId();
    const id2 = await store.getUserId();
    expect(id1).toBeTruthy();
    expect(id1).toBe(id2);
  });

  it('결과를 저장하고 최고 기록을 반환한다', async () => {
    const store = new LocalProgressStore();
    await store.saveResult({ lessonId: 'c1', wpm: 100, accuracy: 90, completedAt: 1 });
    const best = await store.getBest('c1');
    expect(best?.wpm).toBe(100);
  });

  it('더 좋은 기록(높은 타수)만 갱신한다', async () => {
    const store = new LocalProgressStore();
    await store.saveResult({ lessonId: 'c1', wpm: 100, accuracy: 90, completedAt: 1 });
    await store.saveResult({ lessonId: 'c1', wpm: 80, accuracy: 95, completedAt: 2 });
    expect((await store.getBest('c1'))?.wpm).toBe(100);
    await store.saveResult({ lessonId: 'c1', wpm: 120, accuracy: 92, completedAt: 3 });
    expect((await store.getBest('c1'))?.wpm).toBe(120);
  });

  it('완료한 레슨 id 목록을 반환한다', async () => {
    const store = new LocalProgressStore();
    await store.saveResult({ lessonId: 'c1', wpm: 100, accuracy: 90, completedAt: 1 });
    await store.saveResult({ lessonId: 'v1', wpm: 90, accuracy: 88, completedAt: 2 });
    const ids = await store.getCompletedLessonIds();
    expect(new Set(ids)).toEqual(new Set(['c1', 'v1']));
  });

  it('없는 레슨의 최고 기록은 null', async () => {
    const store = new LocalProgressStore();
    expect(await store.getBest('nope')).toBeNull();
  });
});
