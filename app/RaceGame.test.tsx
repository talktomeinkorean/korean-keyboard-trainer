import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { RaceGame } from './RaceGame';

const startBgm = vi.fn();
const pauseBgm = vi.fn();
const stopBgm = vi.fn();
vi.mock('@/lib/audio/sounds', () => ({
  playSfx: vi.fn(),
  startBgm: (...a: unknown[]) => startBgm(...a),
  pauseBgm: (...a: unknown[]) => pauseBgm(...a),
  stopBgm: (...a: unknown[]) => stopBgm(...a),
}));

/** startRace 가 설치한 fetch 스텁 — 호출 내역을 검사할 때 쓴다. */
let fetchMock: ReturnType<typeof vi.fn>;

/** 게임을 시작해 타이머가 돌기 시작한 상태로 만든다. */
async function startRace() {
  fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => ({ words: [{ korean: '사과', english: 'apple' }] }),
  }));
  vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  render(<RaceGame />);

  // 시작 팝업을 닫아야 입력을 받는다
  fireEvent.click(await screen.findByRole('button', { name: 'Game Start' }));
  // 아무 두벌식 키나 누르면 타이머가 시작된다 (오타여도 시작 시각은 기록된다)
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR', bubbles: true }));
  });
}

/** 실제 시간을 흘려보낸다 — elapsed 는 Date.now() 로 계산된다 */
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('레이스 타이머와 BGM 일시정지', () => {
  beforeEach(() => {
    // shouldAdvanceTime 이 없으면 단어 로드 프로미스와 waitFor 가 서로를 기다리며 멈춘다
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));
    startBgm.mockClear();
    pauseBgm.mockClear();
    stopBgm.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('나가기 팝업이 떠 있는 동안 시간이 멈추고, 닫으면 이어서 흐른다', async () => {
    await startRace();

    advance(2000);
    expect(screen.getByTestId('race-timer')).toHaveTextContent('00:02.0');

    // 팝업을 열고 5초를 흘려보내도 표시는 그대로여야 한다
    fireEvent.click(screen.getByTestId('exit-button'));
    advance(5000);
    expect(screen.getByTestId('race-timer')).toHaveTextContent('00:02.0');

    // 닫으면 멈췄던 지점부터 이어진다 (5초는 빠진다)
    fireEvent.click(screen.getByTestId('exit-popup-close'));
    advance(1000);
    expect(screen.getByTestId('race-timer')).toHaveTextContent('00:03.0');

    // 두 번째로 멈춰도 앞서 뺀 시간과 합산된다
    fireEvent.click(screen.getByTestId('exit-button'));
    advance(4000);
    fireEvent.click(screen.getByTestId('exit-popup-close'));
    advance(1000);
    expect(screen.getByTestId('race-timer')).toHaveTextContent('00:04.0');
  });

  it('팝업을 열면 BGM 은 위치를 남긴 채 멈추고, 닫으면 다시 재생된다', async () => {
    await startRace();
    await waitFor(() => expect(startBgm).toHaveBeenCalled());
    // 게임 시작 전(startedAt 이 null 일 때)의 호출은 관심사가 아니다
    startBgm.mockClear();
    stopBgm.mockClear();

    fireEvent.click(screen.getByTestId('exit-button'));
    await waitFor(() => expect(pauseBgm).toHaveBeenCalledTimes(1));
    // 위치가 0 으로 돌아가면 안 되므로 stopBgm 은 불리지 않아야 한다
    expect(stopBgm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('exit-popup-close'));
    await waitFor(() => expect(startBgm).toHaveBeenCalledTimes(1));
  });
});

describe('완주 수 집계', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** /api/finishes 로 나간 POST 호출들 */
  function finishPosts() {
    return fetchMock.mock.calls.filter(
      ([url, init]) => url === '/api/finishes' && (init as RequestInit | undefined)?.method === 'POST',
    );
  }

  it('결과 화면이 뜰 때 완주를 한 번 집계한다', async () => {
    await startRace();
    // 완주 전에는 보내지 않는다
    expect(finishPosts()).toHaveLength(0);

    // 사과 = ㅅㅏ + ㄱㅗㅏ
    for (const code of ['KeyT', 'KeyK', 'KeyR', 'KeyH', 'KeyK']) {
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
      });
    }

    await screen.findByTestId('result-screen');
    await waitFor(() => expect(finishPosts()).toHaveLength(1));
  });
});
