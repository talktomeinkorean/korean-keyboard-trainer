import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultScreen } from './ResultScreen';

function stubFetch(status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: status < 400, status, json: async () => ({}) }) as Response),
  );
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
    stubFetch();
    open();
    expect(screen.getByTestId('result-submit')).toHaveTextContent('Submit This Record');
    expect(screen.getByTestId('result-share')).toHaveTextContent('Save & Share');
    expect(screen.getByTestId('result-retry')).toHaveTextContent('Try Again');
    expect(screen.getByTestId('result-practice')).toHaveAttribute('href', '/lessons');
  });

  it('결과 카드에 기록과 등급을 넘긴다', async () => {
    stubFetch();
    open();
    expect(screen.getByTestId('result-time')).toHaveTextContent('00:33.12');
    expect(screen.getByTestId('result-speed')).toHaveTextContent('112 keys/min');
    expect(screen.getByTestId('result-rank')).toHaveTextContent('토끼');
  });

  it('Try Again 은 콜백을 호출한다', async () => {
    stubFetch();
    const onRetry = vi.fn();
    open({ onRetry });
    fireEvent.click(screen.getByTestId('result-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('저장 기능이 꺼져 있어도 제출 버튼은 보이고, 누르면 안내가 뜬다', async () => {
    stubFetch(503);
    open();
    const submit = screen.getByTestId('result-submit');
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'racer' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'a@b.co' } });
    fireEvent.click(screen.getByTestId('consent-required'));
    fireEvent.click(screen.getByRole('button', { name: /submit record/i }));

    expect(await screen.findByTestId('submit-error')).toHaveTextContent(/isn't open yet/);
    // 실패했으므로 버튼은 잠기지 않는다
    expect(screen.getByTestId('result-submit')).toBeEnabled();
  });

  it('Submit This Record 를 누르면 저장 폼이 열린다', async () => {
    stubFetch();
    open();
    fireEvent.click(screen.getByTestId('result-submit'));
    expect(screen.getByTestId('submit-popup')).toBeInTheDocument();
    expect(screen.getByTestId('consent-required')).toBeInTheDocument();
  });

  it('저장에 성공하면 제출 버튼이 잠기고 문구가 바뀐다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        String(url).startsWith('/api/scores')
          ? ({ ok: true, json: async () => ({ bestMs: 33_120, rank: 3 }) } as Response)
          : ({ ok: true, json: async () => ({ entries: [] }) } as Response),
      ),
    );
    open();
    fireEvent.click(screen.getByTestId('result-submit'));
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'racer' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'a@b.co' } });
    fireEvent.click(screen.getByTestId('consent-required'));
    fireEvent.click(screen.getByRole('button', { name: /submit record/i }));

    // 팝업은 바로 닫히고 결과 화면으로 돌아온다
    await waitFor(() => expect(screen.queryByTestId('submit-popup')).not.toBeInTheDocument());
    const submit = screen.getByTestId('result-submit');
    expect(submit).toBeDisabled();
    expect(submit).toHaveTextContent('✓ Record Submitted');
    expect(submit).toHaveTextContent('Play again for another entry');
  });

  it('새 판을 시작하면 제출 버튼이 원래대로 돌아온다', async () => {
    stubFetch();
    // RaceGame 은 새 단어를 받으면 판 전체를 다시 마운트한다 — 그 상황을 흉내낸다
    const { unmount } = open();
    unmount();

    open();
    const submit = screen.getByTestId('result-submit');
    expect(submit).toBeEnabled();
    expect(submit).toHaveTextContent('Submit This Record');
  });

  it('공유 API 가 없으면 링크를 클립보드에 복사한다', async () => {
    stubFetch();
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    open();
    fireEvent.click(screen.getByTestId('result-share'));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain('00:33.12');
    expect(await screen.findByText('Link copied!')).toBeInTheDocument();
  });
});
