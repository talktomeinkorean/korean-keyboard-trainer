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

  it('시안의 버튼 4개와 연습 유도를 보여준다', async () => {
    stubFetch();
    open();
    expect(screen.getByTestId('result-submit')).toHaveTextContent('Submit This Record');
    expect(screen.getByTestId('result-save')).toHaveTextContent('Save');
    expect(screen.getByTestId('result-share')).toHaveTextContent('Share');
    expect(screen.getByTestId('result-retry')).toHaveTextContent('Try Again');
    expect(screen.getByTestId('result-practice')).toHaveAttribute('href', '/lessons');
  });

  it('결과 카드에 기록과 등급을 넘긴다', async () => {
    stubFetch();
    open();
    expect(screen.getByTestId('result-time')).toHaveTextContent('00:33.12');
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

  // px 로 내려가는 양을 정하면 화면 높이마다 보이는 데까지가 달라진다 —
  // "What can I win?" 답변 카드를 기준으로 삼아 어떤 화면에서도 상품 목록까지 보이게 한다
  it('저장에 성공하면 상품 안내(What can I win?)까지 스크롤한다 (시안 1278:7091)', async () => {
    stubFetch();
    const scrollIntoView = vi.fn();
    vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
      fn(0);
      return 0;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    open();
    screen.getByTestId('faq-first-answer').scrollIntoView = scrollIntoView;

    fireEvent.click(screen.getByTestId('result-submit'));
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'racer' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'a@b.co' } });
    fireEvent.click(screen.getByTestId('consent-required'));
    fireEvent.click(screen.getByRole('button', { name: /submit record/i }));

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.calls[0][0]).toMatchObject({ block: 'end' });
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

  it('Share 는 카드 이미지와 무관하게 링크 팝업을 띄운다', async () => {
    // 카드 이미지 요청이 실패해도 링크는 공유할 수 있어야 한다
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 }) as Response));
    open();
    fireEvent.click(screen.getByTestId('result-share'));

    const popup = await screen.findByTestId('share-popup');
    expect(popup).toBeInTheDocument();
    expect(screen.getByTestId('share-link')).toHaveTextContent(
      `${window.location.origin}/result/33120-112`,
    );
  });

  it('Copy Link 를 누르면 주소를 클립보드에 복사하고 문구가 바뀐다', async () => {
    stubFetch();
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    open();
    fireEvent.click(screen.getByTestId('result-share'));

    fireEvent.click(await screen.findByTestId('share-copy'));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toBe(`${window.location.origin}/result/33120-112`);
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('링크 팝업은 닫을 수 있다', async () => {
    stubFetch();
    open();
    fireEvent.click(screen.getByTestId('result-share'));

    fireEvent.click(await screen.findByTestId('share-popup-close'));
    await waitFor(() => expect(screen.queryByTestId('share-popup')).not.toBeInTheDocument());
  });
});

describe('Save — 카드 이미지', () => {
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

  it('이미지가 도착하기 전에 눌러도 기다렸다 저장한다', async () => {
    stubFetchWithCard();
    const share = vi.fn(async () => {});
    vi.stubGlobal('navigator', { share, canShare: () => true, maxTouchPoints: 5 });
    open();

    // 화면이 뜨자마자 누른다 — 아직 카드가 안 왔을 시점이다
    fireEvent.click(screen.getByTestId('result-save'));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect((share.mock.calls[0][0] as { files: File[] }).files[0].name).toBe(
      'hangeul-typing-race.png',
    );
  });

  it('이미지를 끝내 못 받아도 Save 는 잠기지 않는다 (누르면 아무 일도 없다)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 }) as Response));
    const share = vi.fn(async () => {});
    vi.stubGlobal('navigator', { share, canShare: () => true, maxTouchPoints: 5 });
    open();

    const button = screen.getByTestId('result-save');
    expect(button).toBeEnabled();
    fireEvent.click(button);

    await waitFor(() => expect(share).not.toHaveBeenCalled());
  });

  it('모바일에서는 카드 이미지를 공유 시트로 넘긴다 (사진첩 저장 경로)', async () => {
    stubFetchWithCard();
    const share = vi.fn(async () => {});
    vi.stubGlobal('navigator', { share, canShare: () => true, maxTouchPoints: 5 });
    open();

    fireEvent.click(screen.getByTestId('result-save'));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const arg = share.mock.calls[0][0] as { files: File[]; text?: string };
    expect(arg.files[0].name).toBe('hangeul-typing-race.png');
    expect(arg.files[0].type).toBe('image/png');
    // Save 는 이미지만 다룬다 — 링크·문구는 Share 쪽 몫이다
    expect(arg.text).toBeUndefined();
    expect(screen.queryByTestId('share-popup')).not.toBeInTheDocument();
  });

  it('PC 에서는 카드 이미지를 내려받는다', async () => {
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
    fireEvent.click(screen.getByTestId('result-save'));

    await waitFor(() => expect(downloaded).toBe('hangeul-typing-race.png'));
    // 저장은 저장으로 끝난다 — 링크 팝업은 뜨지 않는다
    expect(screen.queryByTestId('share-popup')).not.toBeInTheDocument();
  });

  it('PC 에 공유 시트가 있어도(맥 사파리) 시트 대신 내려받는다', async () => {
    stubFetchWithCard();
    const share = vi.fn(async () => {});
    // 공유 기능은 있지만 터치 기기가 아니다
    vi.stubGlobal('navigator', { share, canShare: () => true, maxTouchPoints: 0 });
    URL.createObjectURL = vi.fn(() => 'blob:card');
    URL.revokeObjectURL = vi.fn();

    let downloaded: string | null = null;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloaded = this.download;
    });

    open();
    fireEvent.click(screen.getByTestId('result-save'));

    await waitFor(() => expect(downloaded).toBe('hangeul-typing-race.png'));
    expect(share).not.toHaveBeenCalled();
  });
});
