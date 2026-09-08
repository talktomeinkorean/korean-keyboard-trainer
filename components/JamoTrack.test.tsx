import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JamoTrack } from './JamoTrack';

describe('JamoTrack', () => {
  it('지금 치고 있는 음절의 자모만 보여준다', () => {
    render(<JamoTrack item="아마" typedJamoCount={0} errorCount={0} />);
    const chips = screen.getAllByTestId(/^jamo-\d+$/);
    expect(chips.map((c) => c.textContent)).toEqual(['ㅇ', 'ㅏ']);
  });

  it('다음 음절로 넘어가면 그 음절의 자모를 보여준다', () => {
    render(<JamoTrack item="아마" typedJamoCount={2} errorCount={0} />);
    expect(screen.getAllByTestId(/^jamo-\d+$/).map((c) => c.textContent)).toEqual(['ㅁ', 'ㅏ']);
  });

  it('레이스와 같은 3상태 — 맞음/틀림/아직 안 침', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={0} />);
    expect(screen.getByTestId('jamo-0')).toHaveAttribute('data-state', 'correct');
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'todo');
  });

  it('오타가 나면 지금 칠 칩이 틀림이 된다', () => {
    const { rerender } = render(<JamoTrack item="아마" typedJamoCount={1} errorCount={0} />);
    rerender(<JamoTrack item="아마" typedJamoCount={1} errorCount={1} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'wrong');
  });

  it('처음 마운트될 때는 누적 오타가 있어도 틀림으로 두지 않는다', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={5} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'todo');
  });
});
