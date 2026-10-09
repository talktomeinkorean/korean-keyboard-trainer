import { describe, it, expect } from 'vitest';
import {
  COUNTDOWN_WINDOW_MS,
  EVENT_END_MS,
  countdownParts,
  isCountdownVisible,
  remainingMs,
} from './countdown';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

describe('이벤트 종료 시각', () => {
  it('10/12 09:00 KST — FAQ 의 11:59 PM UTC 와 같은 시점', () => {
    expect(new Date(EVENT_END_MS).toISOString()).toBe('2026-10-12T00:00:00.000Z');
  });
});

describe('isCountdownVisible', () => {
  it('24시간보다 더 남았으면 보이지 않는다', () => {
    expect(isCountdownVisible(EVENT_END_MS - COUNTDOWN_WINDOW_MS - SECOND)).toBe(false);
  });

  it('정확히 24시간 전부터 보인다', () => {
    expect(isCountdownVisible(EVENT_END_MS - COUNTDOWN_WINDOW_MS)).toBe(true);
  });

  it('끝난 뒤에도 남아 있다 — 0 이후 처리는 아직 정해지지 않았다', () => {
    expect(isCountdownVisible(EVENT_END_MS + HOUR)).toBe(true);
  });
});

describe('remainingMs', () => {
  it('남은 시간을 그대로 돌려준다', () => {
    expect(remainingMs(EVENT_END_MS - 3 * HOUR)).toBe(3 * HOUR);
  });

  it('지난 뒤에는 0 에서 멈춘다 — 음수를 보여 주지 않는다', () => {
    expect(remainingMs(EVENT_END_MS + HOUR)).toBe(0);
  });
});

describe('countdownParts', () => {
  it('시·분·초를 두 자리씩 채운다 — 일 단위는 두지 않는다 (시안 1857:12569)', () => {
    expect(countdownParts(9 * HOUR + 5 * MINUTE + 3 * SECOND)).toEqual({
      hours: '09',
      minutes: '05',
      seconds: '03',
    });
  });

  it('24시간 창의 처음과 끝', () => {
    expect(countdownParts(COUNTDOWN_WINDOW_MS)).toEqual({
      hours: '24',
      minutes: '00',
      seconds: '00',
    });
    expect(countdownParts(0)).toEqual({ hours: '00', minutes: '00', seconds: '00' });
  });

  it('남은 밀리초는 버린다 — 1초 미만은 0 초로 보인다', () => {
    expect(countdownParts(999)).toEqual({ hours: '00', minutes: '00', seconds: '00' });
  });
});
