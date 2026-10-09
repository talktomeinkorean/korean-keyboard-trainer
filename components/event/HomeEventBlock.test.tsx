import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeEventBlock } from './HomeEventBlock';
import { COUNTDOWN_WINDOW_MS, EVENT_END_MS } from '@/lib/event/countdown';

const HOUR = 60 * 60 * 1000;

function titleTop(): string {
  return screen.getByAltText('Hangeul Day Prize Draw').style.top;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('HomeEventBlock', () => {
  it('카운트다운이 뜨기 전에는 그 자리를 비워 두지 않는다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(EVENT_END_MS - COUNTDOWN_WINDOW_MS - 1000);
    render(<HomeEventBlock />);

    expect(screen.queryByTestId('event-countdown')).toBeNull();
    expect(titleTop()).toBe('475.99px');
  });

  it('카운트다운이 뜨면 블록이 위로 올라가 그만큼 자리를 낸다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(EVENT_END_MS - 3 * HOUR);
    render(<HomeEventBlock />);

    expect(screen.getByTestId('event-countdown')).toBeTruthy();
    expect(titleTop()).toBe('444px');
  });
});
