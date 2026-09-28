import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RaceScene, ERROR_POP_MS } from './RaceScene';

function bgPosition(): string {
  return screen.getByTestId('race-scene-bg').style.backgroundPosition;
}

describe('RaceScene', () => {
  it('시작 시점에는 배경 왼쪽 끝이 보인다', () => {
    render(<RaceScene progress={0} total={10} />);
    expect(bgPosition()).toContain('0%');
  });

  it('진행에 비례해 배경이 이동한다', () => {
    render(<RaceScene progress={3} total={10} />);
    expect(bgPosition()).toContain('30%');
  });

  it('완주 시 배경 오른쪽 끝(결승선)이 보인다', () => {
    render(<RaceScene progress={10} total={10} />);
    expect(bgPosition()).toContain('100%');
  });

  it('진행이 전체를 넘어도 100%를 넘지 않는다', () => {
    render(<RaceScene progress={99} total={10} />);
    expect(bgPosition()).toContain('100%');
  });

  it('total 이 0이어도 안전하게 렌더링한다', () => {
    render(<RaceScene progress={0} total={0} />);
    expect(bgPosition()).toContain('0%');
  });

  it('배경은 확대해 쓰므로 pixelated 렌더링을 지정한다', () => {
    render(<RaceScene progress={0} total={10} />);
    expect(screen.getByTestId('race-scene-bg').style.imageRendering).toBe('pixelated');
  });

  it('러너 스프라이트를 표시한다', () => {
    render(<RaceScene progress={0} total={10} />);
    const runner = screen.getByTestId('race-runner');
    expect(runner.style.backgroundImage).toContain('run_sheet.webp');
    // 시트가 표시 크기보다 커서 확대될 일이 없다 — 최근접을 쓰면 축소할 때 디테일이 날아간다
    expect(runner.style.imageRendering).toBe('');
  });

  it('진행 중일 때만 달리기 애니메이션을 재생한다', () => {
    const { rerender } = render(<RaceScene progress={0} total={10} />);
    expect(screen.getByTestId('race-runner').style.animation).toBe('');

    rerender(<RaceScene progress={0} total={10} running />);
    expect(screen.getByTestId('race-runner').style.animation).toContain('sprite-run');
    expect(screen.getByTestId('race-runner').style.animation).toContain('steps(4)');
  });
});

describe('RaceScene 오타 느낌표', () => {
  afterEach(() => vi.useRealTimers());

  it('오타가 나면 캐릭터 위에 느낌표가 떴다가 사라진다', () => {
    vi.useFakeTimers();
    const { rerender } = render(<RaceScene progress={0} total={10} errorCount={0} />);
    expect(screen.queryByTestId('race-error-pop')).toBeNull();

    rerender(<RaceScene progress={0} total={10} errorCount={1} />);
    expect(screen.getByTestId('race-error-pop')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(ERROR_POP_MS - 1));
    expect(screen.queryByTestId('race-error-pop')).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('race-error-pop')).toBeNull();
  });

  it('연달아 틀리면 느낌표가 처음부터 다시 튀어오른다', () => {
    vi.useFakeTimers();
    const { rerender } = render(<RaceScene progress={0} total={10} errorCount={0} />);
    rerender(<RaceScene progress={0} total={10} errorCount={1} />);
    const first = screen.getByTestId('race-error-pop');

    act(() => vi.advanceTimersByTime(ERROR_POP_MS - 100));
    rerender(<RaceScene progress={0} total={10} errorCount={2} />);
    // key 가 바뀌어 새 엘리먼트로 다시 붙는다 (같은 엘리먼트면 애니메이션이 이어진다)
    expect(screen.getByTestId('race-error-pop')).not.toBe(first);

    act(() => vi.advanceTimersByTime(ERROR_POP_MS - 1));
    expect(screen.queryByTestId('race-error-pop')).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('race-error-pop')).toBeNull();
  });
});
