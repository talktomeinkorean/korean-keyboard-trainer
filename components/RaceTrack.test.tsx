import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RaceTrack } from './RaceTrack';

describe('RaceTrack', () => {
  it('total + 결승선 만큼의 구간을 그린다', () => {
    render(<RaceTrack progress={0} total={5} />);
    // 출발 포함 5개 구간 + 결승선 칸 = 6칸
    expect(screen.getAllByTestId(/^race-cell-\d+$/)).toHaveLength(6);
  });

  it('러너가 progress 구간에 위치한다', () => {
    render(<RaceTrack progress={2} total={5} />);
    expect(screen.getByTestId('race-cell-2')).toContainElement(
      screen.getByTestId('race-runner'),
    );
  });

  it('완주하면 러너가 결승선 칸에 위치한다', () => {
    render(<RaceTrack progress={5} total={5} />);
    expect(screen.getByTestId('race-cell-5')).toContainElement(
      screen.getByTestId('race-runner'),
    );
  });
});
