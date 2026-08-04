import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassageView } from './PassageView';

const LINES = ['동해물과 백두산이', '마르고 닳도록', '하느님이 보우하사', '우리나라 만세'];

describe('PassageView', () => {
  it('이전/현재/다음 3줄만 렌더링한다', () => {
    render(<PassageView lines={LINES} currentIndex={1} typedJamoCount={0} />);
    expect(screen.getByTestId('passage-line-0')).toHaveAttribute('data-state', 'done');
    expect(screen.getByTestId('passage-line-1')).toHaveAttribute('data-state', 'current');
    expect(screen.getByTestId('passage-line-2')).toHaveAttribute('data-state', 'todo');
    expect(screen.queryByTestId('passage-line-3')).toBeNull();
  });

  it('첫 줄에서는 이전 줄 없이 현재/다음만 보인다', () => {
    render(<PassageView lines={LINES} currentIndex={0} typedJamoCount={0} />);
    expect(screen.getByTestId('passage-line-0')).toHaveAttribute('data-state', 'current');
    expect(screen.getByTestId('passage-line-1')).toHaveAttribute('data-state', 'todo');
    expect(screen.queryByTestId('passage-line-2')).toBeNull();
  });

  it('마지막 줄에서는 다음 줄 없이 이전/현재만 보인다', () => {
    render(<PassageView lines={LINES} currentIndex={3} typedJamoCount={0} />);
    expect(screen.getByTestId('passage-line-2')).toHaveAttribute('data-state', 'done');
    expect(screen.getByTestId('passage-line-3')).toHaveAttribute('data-state', 'current');
  });

  it('현재 줄 아래 입력 줄에 자모 진행 분할과 캐럿을 표시한다', () => {
    // 마르고 닳도록: ㅁㅏㄹ(3) → '마' 완료 + 'ㄹ' 조합 중(르 표시)
    render(<PassageView lines={LINES} currentIndex={1} typedJamoCount={3} />);
    expect(screen.getByTestId('passage-input-done')).toHaveTextContent('마');
    expect(screen.getByTestId('passage-input-current')).toHaveTextContent('르');
    expect(screen.getByTestId('passage-caret')).toBeInTheDocument();
  });

  it('이전 줄에는 체크 표시가 붙는다', () => {
    render(<PassageView lines={LINES} currentIndex={2} typedJamoCount={0} />);
    expect(screen.getByTestId('passage-line-1')).toHaveTextContent('✓');
  });
});
