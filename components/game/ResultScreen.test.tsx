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

describe('Save & Share — 카드 이미지', () => {
  /** 카드 PNG 까지 내려주는 fetch 스텁 */
  function stubFetchWithCard() {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        String(url).includes('/card')
          ? ({
              ok: true,
              status: 200,
              blob: async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
            } as unknown as Response)
          : ({ ok: true, status: 200, json: async () => ({}) } as unknown as Response)),
    );
  }

  afterEach(() => vi.restoreAllMocks());

  it('공유 시트에 파일을 넘길 수 있으면 카드 이미지를 공유한다', async () => {
    stubFetchWithCard();
    const share = vi.fn(async () => {});
    vi.stubGlobal('navigator', { share, canShare: () => true });
    open();

    // 카드 이미지는 화면이 뜰 때 비동기로 받아온다. 준비되기 전 클릭은 링크 공유로
    // 떨어지므로, 파일이 실린 호출이 나올 때까지 눌러본다.
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('result-share'));
      expect(share.mock.calls.at(-1)?.[0]).toHaveProperty('files');
    });

    const arg = share.mock.calls.at(-1)![0] as { files: File[]; text: string };
    expect(arg.files[0].name).toBe('hangeul-typing-race.png');
    expect(arg.files[0].type).toBe('image/png');
    // 파일과 함께 넘긴 url 은 버려지는 일이 많아 문구 안에 넣는다
    expect(arg.text).toContain('/result/33120-112');
  });

  it('파일 공유가 안 되면 카드 이미지를 내려받는다', async () => {
    stubFetchWithCard();
    vi.stubGlobal('navigator', {}); // share·canShare 없음 = PC
    // jsdom 에는 objectURL 구현이 없다
    URL.createObjectURL = vi.fn(() => 'blob:card');
    URL.revokeObjectURL = vi.fn();

    let downloaded: string | null = null;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloaded = this.download;
    });

    open();
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('result-share'));
      expect(downloaded).toBe('hangeul-typing-race.png');
    });

    expect(await screen.findByText('Image saved!')).toBeInTheDocument();
  });
});
