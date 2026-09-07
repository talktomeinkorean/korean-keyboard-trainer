import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JamoTrack } from './JamoTrack';

describe('JamoTrack', () => {
  it('음절별로 자모 칩을 순서대로 표시한다', () => {
    render(<JamoTrack item="아마" typedJamoCount={0} errorCount={0} />);
    const chips = screen.getAllByTestId(/^jamo-\d+$/);
    expect(chips.map((c) => c.textContent)).toEqual(['ㅇ', 'ㅏ', 'ㅁ', 'ㅏ']);
  });

  it('레이스와 같은 3상태 — 맞음/틀림/아직 안 침', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={0} />);
    expect(screen.getByTestId('jamo-0')).toHaveAttribute('data-state', 'correct');
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'todo');
    expect(screen.getByTestId('jamo-3')).toHaveAttribute('data-state', 'todo');
  });

  it('오타가 나면 지금 칠 칩이 틀림이 된다', () => {
    const { rerender } = render(<JamoTrack item="아마" typedJamoCount={1} errorCount={0} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'todo');

    rerender(<JamoTrack item="아마" typedJamoCount={1} errorCount={1} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'wrong');
  });

  it('올바르게 입력해 넘어가면 틀림 표시가 풀린다', () => {
    const { rerender } = render(<JamoTrack item="아마" typedJamoCount={1} errorCount={1} />);
    rerender(<JamoTrack item="아마" typedJamoCount={1} errorCount={2} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'wrong');

    rerender(<JamoTrack item="아마" typedJamoCount={2} errorCount={2} />);
    expect(screen.getByTestId('jamo-2')).toHaveAttribute('data-state', 'todo');
  });

  it('처음 마운트될 때는 누적 오타가 있어도 틀림으로 두지 않는다', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={5} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'todo');
  });
});
