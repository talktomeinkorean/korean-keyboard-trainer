import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingLine } from './TypingLine';

describe('TypingLine', () => {
  it('완성된 음절만 초록으로, 조합 중인 음절은 진행 중으로 표시한다', () => {
    // 안녕 에서 ㅇ 만 입력 → 완성 음절 없음, '안' 은 조합 중
    render(<TypingLine target="안녕" typedJamoCount={1} />);
    expect(screen.getByTestId('done')).toHaveTextContent('');
    expect(screen.getByTestId('current')).toHaveTextContent('안');
    expect(screen.getByTestId('todo')).toHaveTextContent('녕');
  });

  it('음절이 완성되면 완료로 넘어간다', () => {
    // 안녕 에서 ㅇㅏㄴ 입력 → '안' 완성, '녕' 은 아직 시작 안 함
    render(<TypingLine target="안녕" typedJamoCount={3} />);
    expect(screen.getByTestId('done')).toHaveTextContent('안');
    expect(screen.getByTestId('current')).toHaveTextContent('');
    expect(screen.getByTestId('todo')).toHaveTextContent('녕');
  });

  it('입력 전에는 전체가 남은 텍스트로 표시된다', () => {
    render(<TypingLine target="한국어" typedJamoCount={0} />);
    expect(screen.getByTestId('done')).toHaveTextContent('');
    expect(screen.getByTestId('current')).toHaveTextContent('');
    expect(screen.getByTestId('todo')).toHaveTextContent('한국어');
  });

  it('조합 중인 음절 뒤에 깜빡이는 캐럿을 표시한다', () => {
    render(<TypingLine target="안녕" typedJamoCount={1} />);
    const caret = screen.getByTestId('caret');
    // done → current → caret → todo 순서
    expect(screen.getByTestId('current').nextElementSibling).toBe(caret);
    expect(caret.nextElementSibling).toBe(screen.getByTestId('todo'));
  });
});
