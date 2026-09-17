import { describe, it, expect } from 'vitest';
import { bestKeysPerPlayer } from './top';

const row = (email: string, nickname: string, keys_per_min: number) => ({ email, nickname, keys_per_min });

describe('bestKeysPerPlayer', () => {
  it('플레이어마다 가장 높은 타수(정렬된 첫 행) 하나만 남긴다', () => {
    const rows = [row('a@x.co', 'A-best', 300), row('b@x.co', 'B', 250), row('a@x.co', 'A-old', 200)];
    expect(bestKeysPerPlayer(rows, 10)).toEqual([
      { nickname: 'A-best', keysPerMin: 300 },
      { nickname: 'B', keysPerMin: 250 },
    ]);
  });

  it('상위 limit 명까지만', () => {
    const rows = [row('a@x.co', 'A', 3), row('b@x.co', 'B', 2), row('c@x.co', 'C', 1)];
    expect(bestKeysPerPlayer(rows, 2).map((e) => e.nickname)).toEqual(['A', 'B']);
  });
});
