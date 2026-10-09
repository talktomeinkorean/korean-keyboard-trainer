import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// "이번 방문에서 닫았다" 는 모듈 변수라 테스트마다 새로 불러온다
async function renderPopup(races: number | null = 25432) {
  vi.resetModules();
  const { EventEndedPopup, HIDE_KEY } = await import('./EventEndedPopup');
  return { ...render(<EventEndedPopup races={races} />), HIDE_KEY };
}

describe('EventEndedPopup', () => {
  beforeEach(() => localStorage.clear());

  it('이벤트 기간 완주 수를 천 단위로 끊고 + 를 붙인다', async () => {
    await renderPopup(25432);
    expect(screen.getByTestId('event-ended-races')).toHaveTextContent('25,432+');
  });

  it('숫자를 못 읽었으면 "-" 만 보인다', async () => {
    await renderPopup(null);
    expect(screen.getByTestId('event-ended-races')).toHaveTextContent(/^-$/);
  });

  it('Practice Typing 을 누르면 닫히고, 그냥 닫으면 다음 방문에 다시 뜬다', async () => {
    const { HIDE_KEY } = await renderPopup();
    fireEvent.click(screen.getByRole('button', { name: 'Practice Typing' }));
    expect(screen.queryByTestId('event-ended-popup')).toBeNull();
    expect(localStorage.getItem(HIDE_KEY)).toBeNull();
  });

  it('Don’t show again 을 고르고 닫으면 다시 뜨지 않는다', async () => {
    const { HIDE_KEY, unmount } = await renderPopup();
    fireEvent.click(screen.getByTestId('event-ended-hide'));
    fireEvent.click(screen.getByRole('button', { name: 'Practice Typing' }));
    expect(localStorage.getItem(HIDE_KEY)).toBe('hidden');
    unmount();

    await renderPopup();
    expect(screen.queryByTestId('event-ended-popup')).toBeNull();
  });

  it('같은 방문 안에서 목록으로 돌아오면 다시 뜨지 않는다', async () => {
    vi.resetModules();
    const { EventEndedPopup } = await import('./EventEndedPopup');
    const first = render(<EventEndedPopup races={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Practice Typing' }));
    first.unmount();

    // 모듈을 다시 불러오지 않는다 — 페이지를 옮겨 다녀도 모듈은 그대로다
    render(<EventEndedPopup races={1} />);
    expect(screen.queryByTestId('event-ended-popup')).toBeNull();
  });
});
