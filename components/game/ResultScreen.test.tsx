import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultScreen } from './ResultScreen';

/** 저장 기능이 켜지려면 /api/leaderboard 가 200 이어야 한다. */
function stubLeaderboard(ok = true) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok, json: async () => ({ entries: [] }) }) as Response));
}

function open(props: Partial<Parameters<typeof ResultScreen>[0]> = {}) {
  return render(
    <ResultScreen timeMs={33_120} accuracy={98} keysPerMin={112} onRetry={() => {}} {...props} />,
  );
}

describe('ResultScreen', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('시안의 버튼 3개와 연습 유도를 보여준다', async () => {
    stubLeaderboard();
    open();
    expect(await screen.findByTestId('result-submit')).toHaveTextContent('Submit This Record');
    expect(screen.getByTestId('result-share')).toHaveTextContent('Save & Share');
    expect(screen.getByTestId('result-retry')).toHaveTextContent('Try Again');
    expect(screen.getByTestId('result-practice')).toHaveAttribute('href', '/lessons');
  });

  it('결과 카드에 기록과 등급을 넘긴다', async () => {
    stubLeaderboard();
    open();
    await screen.findByTestId('result-submit'); // 저장 기능 확인이 끝날 때까지 기다린다
    expect(screen.getByTestId('result-time')).toHaveTextContent('00:33.12');
    expect(screen.getByTestId('result-speed')).toHaveTextContent('112 keys/min');
    expect(screen.getByTestId('result-rank')).toHaveTextContent('토끼');
  });

  it('Try Again 은 콜백을 호출한다', async () => {
    stubLeaderboard();
    const onRetry = vi.fn();
    open({ onRetry });
    await screen.findByTestId('result-submit');
    fireEvent.click(screen.getByTestId('result-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('저장 기능이 꺼져 있으면 제출 버튼을 숨긴다', async () => {
    stubLeaderboard(false);
    open();
    await waitFor(() => expect(screen.queryByTestId('result-submit')).not.toBeInTheDocument());
  });

  it('Submit This Record 를 누르면 저장 폼이 열린다', async () => {
    stubLeaderboard();
    open();
    fireEvent.click(await screen.findByTestId('result-submit'));
    expect(screen.getByTestId('submit-popup')).toBeInTheDocument();
    expect(screen.getByTestId('consent-required')).toBeInTheDocument();
  });

  it('공유 API 가 없으면 링크를 클립보드에 복사한다', async () => {
    stubLeaderboard();
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    open();
    fireEvent.click(screen.getByTestId('result-share'));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain('00:33.12');
    expect(await screen.findByText('Link copied!')).toBeInTheDocument();
  });
});
