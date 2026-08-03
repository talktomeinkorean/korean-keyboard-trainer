import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassageView } from './PassageView';

const LINES = ['동해물과 백두산이', '마르고 닳도록', '하느님이 보우하사'];

describe('PassageView', () => {
  it('모든 줄을 done/current/todo 상태로 렌더링한다', () => {
    render(<PassageView lines={LINES} currentIndex={1} typedJamoCount={0} />);
    expect(screen.getByTestId('passage-line-0')).toHaveAttribute('data-state', 'done');
    expect(screen.getByTestId('passage-line-1')).toHaveAttribute('data-state', 'current');
    expect(screen.getByTestId('passage-line-2')).toHaveAttribute('data-state', 'todo');
  });

  it('현재 줄 아래 입력 줄에 자모 진행 분할과 캐럿을 표시한다', () => {
    // 마르고: ㅁㅏ(2) 입력 → done '마', current '' … ㅁㅏㄹ(3) → 마 완료 + ㄹ 조합 중
    render(<PassageView lines={LINES} currentIndex={1} typedJamoCount={3} />);
    const input = screen.getByTestId('passage-input');
    expect(input).toHaveTextContent('마');
    expect(screen.getByTestId('passage-input-done')).toHaveTextContent('마');
    expect(screen.getByTestId('passage-input-current')).toHaveTextContent('르');
    expect(screen.getByTestId('passage-caret')).toBeInTheDocument();
  });

  it('완료된 줄에는 체크 표시가 붙는다', () => {
    render(<PassageView lines={LINES} currentIndex={2} typedJamoCount={0} />);
    expect(screen.getByTestId('passage-line-0')).toHaveTextContent('✓');
    expect(screen.getByTestId('passage-line-1')).toHaveTextContent('✓');
  });
});
