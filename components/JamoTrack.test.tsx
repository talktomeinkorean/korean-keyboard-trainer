import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JamoTrack } from './JamoTrack';

describe('JamoTrack', () => {
  it('음절별로 자모 칩을 순서대로 표시한다', () => {
    render(<JamoTrack item="아마" typedJamoCount={0} errorCount={0} />);
    const chips = screen.getAllByTestId(/^jamo-\d+$/);
    expect(chips.map((c) => c.textContent)).toEqual(['ㅇ', 'ㅏ', 'ㅁ', 'ㅏ']);
  });

  it('완료/현재/대기 상태를 data-state 로 구분한다', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={0} />);
    expect(screen.getByTestId('jamo-0')).toHaveAttribute('data-state', 'done');
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'current');
    expect(screen.getByTestId('jamo-2')).toHaveAttribute('data-state', 'todo');
    expect(screen.getByTestId('jamo-3')).toHaveAttribute('data-state', 'todo');
  });

  it('errorCount 가 증가하면 현재 칩이 플래시된다', () => {
    const { rerender } = render(
      <JamoTrack item="아마" typedJamoCount={1} errorCount={0} />,
    );
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-flash', 'false');

    rerender(<JamoTrack item="아마" typedJamoCount={1} errorCount={1} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-flash', 'true');
  });

  it('처음 마운트될 때는 플래시하지 않는다 (누적 errorCount 가 있어도)', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={5} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-flash', 'false');
  });
});
