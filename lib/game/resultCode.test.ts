import { describe, it, expect } from 'vitest';
import { encodeResultCode, decodeResultCode } from './resultCode';

describe('resultCode', () => {
  it('기록과 타수를 왕복한다', () => {
    const code = encodeResultCode({ timeMs: 33_120, keysPerMin: 112 });
    expect(code).toBe('33120-112');
    expect(decodeResultCode(code)).toEqual({ timeMs: 33_120, keysPerMin: 112 });
  });

  it('소수점은 반올림해 정수로만 담는다', () => {
    expect(encodeResultCode({ timeMs: 33_120.7, keysPerMin: 111.4 })).toBe('33121-111');
  });

  it('형식이 어긋나면 null 이다', () => {
    for (const bad of ['', '33120', 'abc-1', '33120-', '-112', '33120-112-3', '33120.5-112']) {
      expect(decodeResultCode(bad)).toBeNull();
    }
  });

  it('저장 가능한 기록 범위를 벗어나면 null 이다', () => {
    expect(decodeResultCode('2999-100')).toBeNull(); // 3초 미만
    expect(decodeResultCode('3600001-100')).toBeNull(); // 1시간 초과
    expect(decodeResultCode('33120-2001')).toBeNull(); // 비현실적인 타수
  });

  it('범위 경계는 받아들인다', () => {
    expect(decodeResultCode('3000-0')).toEqual({ timeMs: 3000, keysPerMin: 0 });
    expect(decodeResultCode('3600000-2000')).toEqual({ timeMs: 3_600_000, keysPerMin: 2000 });
  });
});
