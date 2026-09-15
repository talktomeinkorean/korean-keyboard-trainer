import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { RACE_BACKGROUNDS, pickRaceBackground } from './backgrounds';

describe('레이스 배경', () => {
  it('세 장이고 파일이 실제로 있다', () => {
    expect(RACE_BACKGROUNDS.map((b) => b.id)).toEqual(['hanriver', 'gwanghwamun', 'uljiro']);
    for (const bg of RACE_BACKGROUNDS) {
      expect(existsSync(join(process.cwd(), 'public', bg.src))).toBe(true);
    }
  });

  it('난수 구간마다 세 배경이 고르게 뽑힌다', () => {
    expect(pickRaceBackground(() => 0).id).toBe('hanriver');
    expect(pickRaceBackground(() => 0.34).id).toBe('gwanghwamun');
    expect(pickRaceBackground(() => 0.99).id).toBe('uljiro');
  });
});
