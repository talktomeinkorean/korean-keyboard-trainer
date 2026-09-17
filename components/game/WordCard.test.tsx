import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WordCard } from './WordCard';

const word = { korean: '한글', english: 'Hangeul' };

describe('WordCard', () => {
  it('문제 번호와 영어 뜻을 표시한다', () => {
    render(<WordCard word={word} typedJamoCount={0} index={3} total={10} />);
    expect(screen.getByTestId('word-counter')).toHaveTextContent('3/10');
    expect(screen.getByTestId('word-english')).toHaveTextContent('Hangeul');
  });

  it('친 글자 / 지금 칠 음절 / 남은 글자로 나눈다', () => {
    // 한글: ㅎㅏㄴ(3) 입력 → '한' 완료, 다음은 '글'
    render(<WordCard word={word} typedJamoCount={3} index={1} total={10} />);
    expect(screen.getByTestId('word-typed')).toHaveTextContent(/^한$/);
    expect(screen.getByTestId('word-current')).toHaveTextContent(/^글$/);
    expect(screen.getByTestId('word-remaining')).toHaveTextContent(/^$/);
  });

  it('지금 칠 음절만 깜빡인다 — 시작 전엔 첫 글자, 조합 중엔 그 글자', () => {
    const { rerender } = render(<WordCard word={word} typedJamoCount={0} index={1} total={10} />);
    expect(screen.getByTestId('word-current')).toHaveTextContent(/^한$/);
    expect(screen.getByTestId('word-current').className).toContain('animate-soft-pulse');
    expect(screen.getByTestId('word-remaining')).toHaveTextContent(/^글$/);

    // ㅎㅏ 까지 — 아직 '한' 을 조합 중
    rerender(<WordCard word={word} typedJamoCount={2} index={1} total={10} />);
    expect(screen.getByTestId('word-typed')).toHaveTextContent(/^$/);
    expect(screen.getByTestId('word-current')).toHaveTextContent(/^한$/);
  });

  it('현재 음절의 자모만 칩으로 보여준다', () => {
    render(<WordCard word={word} typedJamoCount={0} index={1} total={10} />);
    const chips = screen.getAllByTestId(/^syllable-jamo-\d+$/);
    expect(chips.map((c) => c.textContent)).toEqual(['ㅎ', 'ㅏ', 'ㄴ']);
  });

  it('맞은 자모와 아직 안 친 자모를 구분한다', () => {
    render(<WordCard word={word} typedJamoCount={2} index={1} total={10} />);
    expect(screen.getByTestId('syllable-jamo-0')).toHaveAttribute('data-state', 'correct');
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'correct');
    expect(screen.getByTestId('syllable-jamo-2')).toHaveAttribute('data-state', 'todo');
  });

  it('오타가 나면 지금 칠 자모를 틀렸을 때로 표시한다', () => {
    const { rerender } = render(
      <WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={0} />,
    );
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'todo');

    rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={1} />);
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'wrong');
    // 맞은 자모는 영향받지 않는다
    expect(screen.getByTestId('syllable-jamo-0')).toHaveAttribute('data-state', 'correct');
  });

  it('올바르게 입력해 진행하면 틀림 표시가 풀린다', () => {
    const { rerender } = render(
      <WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={1} />,
    );
    rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={2} />);
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'wrong');

    rerender(<WordCard word={word} typedJamoCount={2} index={1} total={10} errorCount={2} />);
    expect(screen.getByTestId('syllable-jamo-2')).toHaveAttribute('data-state', 'todo');
  });

  it('영어 뜻이 없으면 생략한다', () => {
    render(<WordCard word={{ korean: '한글', english: null }} typedJamoCount={0} index={1} total={10} />);
    expect(screen.queryByTestId('word-english')).toBeNull();
  });
});
