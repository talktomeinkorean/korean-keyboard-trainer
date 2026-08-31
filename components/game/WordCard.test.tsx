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

  it('입력한 글자는 진하게, 남은 글자는 흐리게 나눈다', () => {
    // 한글: ㅎㅏㄴ(3) 입력 → '한' 완료, '글' 남음
    render(<WordCard word={word} typedJamoCount={3} index={1} total={10} />);
    expect(screen.getByTestId('word-typed')).toHaveTextContent('한');
    expect(screen.getByTestId('word-remaining')).toHaveTextContent('글');
  });

  it('현재 음절의 자모만 칩으로 보여준다', () => {
    render(<WordCard word={word} typedJamoCount={0} index={1} total={10} />);
    const chips = screen.getAllByTestId(/^syllable-jamo-\d+$/);
    expect(chips.map((c) => c.textContent)).toEqual(['ㅎ', 'ㅏ', 'ㄴ']);
  });

  it('입력한 자모 칩을 구분한다', () => {
    render(<WordCard word={word} typedJamoCount={2} index={1} total={10} />);
    expect(screen.getByTestId('syllable-jamo-0')).toHaveAttribute('data-typed', 'true');
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-typed', 'true');
    expect(screen.getByTestId('syllable-jamo-2')).toHaveAttribute('data-typed', 'false');
  });

  it('영어 뜻이 없으면 생략한다', () => {
    render(<WordCard word={{ korean: '한글', english: null }} typedJamoCount={0} index={1} total={10} />);
    expect(screen.queryByTestId('word-english')).toBeNull();
  });
});
