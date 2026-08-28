import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RaceScene } from './RaceScene';

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

  it('픽셀아트가 뭉개지지 않도록 pixelated 렌더링을 지정한다', () => {
    render(<RaceScene progress={0} total={10} />);
    expect(screen.getByTestId('race-scene-bg').style.imageRendering).toBe('pixelated');
  });

  it('러너 스프라이트를 표시한다', () => {
    render(<RaceScene progress={0} total={10} />);
    const runner = screen.getByTestId('race-runner');
    expect(runner.style.backgroundImage).toContain('run_sheet.webp');
    expect(runner.style.imageRendering).toBe('pixelated');
  });

  it('진행 중일 때만 달리기 애니메이션을 재생한다', () => {
    const { rerender } = render(<RaceScene progress={0} total={10} />);
    expect(screen.getByTestId('race-runner').style.animation).toBe('');

    rerender(<RaceScene progress={0} total={10} running />);
    expect(screen.getByTestId('race-runner').style.animation).toContain('sprite-run');
    expect(screen.getByTestId('race-runner').style.animation).toContain('steps(4)');
  });
});
