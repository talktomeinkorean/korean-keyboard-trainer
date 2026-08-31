import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RaceResultCard } from './RaceResultCard';

/** 마운트 시 /api/leaderboard 를 부르므로 저장 UI 가 켜지도록 응답을 흉내낸다. */
function stubFetch(onScorePost?: (body: unknown) => void) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (String(url).startsWith('/api/scores')) {
      onScorePost?.(JSON.parse(String(init?.body)));
      return { ok: true, json: async () => ({ bestMs: 15000, rank: 1 }) } as Response;
    }
    return { ok: true, json: async () => ({ entries: [] }) } as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('RaceResultCard 동의 항목', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('필수/선택 동의 체크박스를 표시한다', async () => {
    stubFetch();
    render(<RaceResultCard timeMs={15000} accuracy={98} onRetry={() => {}} />);
    expect(await screen.findByTestId('consent-required')).toBeInTheDocument();
    expect(screen.getByTestId('consent-marketing')).toBeInTheDocument();
  });

  it('필수 동의 전에는 저장 버튼이 비활성이다', async () => {
    stubFetch();
    render(<RaceResultCard timeMs={15000} accuracy={98} onRetry={() => {}} />);
    const submit = await screen.findByRole('button', { name: /save my score/i });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByTestId('consent-required'));
    expect(submit).toBeEnabled();
  });

  it('동의 값을 그대로 제출한다', async () => {
    let sent: Record<string, unknown> | undefined;
    stubFetch((body) => { sent = body as Record<string, unknown>; });
    render(<RaceResultCard timeMs={15000} accuracy={98} onRetry={() => {}} />);

    fireEvent.change(await screen.findByPlaceholderText(/nickname/i), { target: { value: 'racer' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@b.co' } });
    fireEvent.click(screen.getByTestId('consent-required'));
    fireEvent.click(screen.getByTestId('consent-marketing'));
    fireEvent.click(screen.getByRole('button', { name: /save my score/i }));

    await waitFor(() => expect(sent).toBeDefined());
    expect(sent).toMatchObject({ consentRequired: true, consentMarketing: true });
  });

  it('동의는 저장하지 않아 다음 판에서 다시 받는다', async () => {
    stubFetch();
    const { unmount } = render(<RaceResultCard timeMs={15000} accuracy={98} onRetry={() => {}} />);
    fireEvent.click(await screen.findByTestId('consent-required'));
    unmount();

    render(<RaceResultCard timeMs={15000} accuracy={98} onRetry={() => {}} />);
    expect(await screen.findByTestId('consent-required')).not.toBeChecked();
  });
});
