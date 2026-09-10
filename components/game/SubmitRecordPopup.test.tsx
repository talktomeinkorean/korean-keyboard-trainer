import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitRecordPopup } from './SubmitRecordPopup';

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

function open() {
  render(<SubmitRecordPopup timeMs={15000} accuracy={98} onClose={() => {}} />);
}

describe('SubmitRecordPopup 동의 항목', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('필수/선택 동의 체크박스를 표시한다', () => {
    stubFetch();
    open();
    expect(screen.getByTestId('consent-required')).toBeInTheDocument();
    expect(screen.getByTestId('consent-marketing')).toBeInTheDocument();
  });

  it('시안(519:14583)의 동의 문구를 그대로 쓴다', () => {
    stubFetch();
    open();
    expect(
      screen.getByText(/I agree to have my name and email used for the Hangeul Day drawing/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Subscribe to the TTMIK newsletter and get 50% OFF a yearly Courses/),
    ).toBeInTheDocument();
  });

  it('필수 동의 전에는 저장 버튼이 비활성이다', () => {
    stubFetch();
    open();
    const submit = screen.getByRole('button', { name: /submit record/i });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByTestId('consent-required'));
    expect(submit).toBeEnabled();
  });

  it('동의 값을 그대로 제출한다', async () => {
    let sent: Record<string, unknown> | undefined;
    stubFetch((body) => {
      sent = body as Record<string, unknown>;
    });
    open();

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'racer' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'a@b.co' } });
    fireEvent.click(screen.getByTestId('consent-required'));
    fireEvent.click(screen.getByTestId('consent-marketing'));
    fireEvent.click(screen.getByRole('button', { name: /submit record/i }));

    await waitFor(() => expect(sent).toBeDefined());
    expect(sent).toMatchObject({ consentRequired: true, consentMarketing: true });
  });

  it('동의는 저장하지 않아 다음 판에서 다시 받는다', () => {
    stubFetch();
    const { unmount } = render(
      <SubmitRecordPopup timeMs={15000} accuracy={98} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByTestId('consent-required'));
    unmount();

    open();
    expect(screen.getByTestId('consent-required')).not.toBeChecked();
  });

  it('저장에 성공하면 별도 화면 없이 바로 닫는다', async () => {
    const fetchMock = stubFetch();
    const onClose = vi.fn();
    const onSubmitted = vi.fn();
    render(
      <SubmitRecordPopup timeMs={15000} accuracy={98} onClose={onClose} onSubmitted={onSubmitted} />,
    );
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'racer' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'a@b.co' } });
    fireEvent.click(screen.getByTestId('consent-required'));
    fireEvent.click(screen.getByRole('button', { name: /submit record/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    // 리더보드는 더 이상 쓰지 않는다
    expect(fetchMock.mock.calls.map((c) => String(c[0]))).toEqual(['/api/scores']);
  });
});
