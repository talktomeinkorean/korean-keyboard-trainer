import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WordCard, ERROR_FLASH_MS } from './WordCard';

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

  it('틀린 자모 칩은 ERROR_FLASH_MS 뒤 todo 로 돌아온다', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={0} />,
    );
    rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={1} />);
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'wrong');

    act(() => vi.advanceTimersByTime(ERROR_FLASH_MS - 1));
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'wrong');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'todo');
    vi.useRealTimers();
  });

  it('틀린 뒤 바로 맞게 치면 다음 칩은 주황이 아니다 (테두리는 남는다)', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={0} />,
    );
    rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={1} />);
    expect(screen.getByTestId('syllable-jamo-1')).toHaveAttribute('data-state', 'wrong');

    // 타이머가 끝나기 전에 올바르게 입력해 다음 자모로 넘어간다
    act(() => vi.advanceTimersByTime(100));
    rerender(<WordCard word={word} typedJamoCount={2} index={1} total={10} errorCount={1} />);
    expect(screen.getByTestId('syllable-jamo-2')).toHaveAttribute('data-state', 'todo');
    // 오타를 놓치지 않도록 테두리는 남는다
    expect(screen.getByTestId('word-card').className).toContain('border-[#ff5e23]');
    vi.useRealTimers();
  });

  it('틀린 뒤 다음 단어로 넘어가면 주황 칩이 따라오지 않는다', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={0} />,
    );
    rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={1} />);

    act(() => vi.advanceTimersByTime(100));
    rerender(
      <WordCard
        word={{ korean: '사과', english: 'apple' }}
        typedJamoCount={0}
        index={2}
        total={10}
        errorCount={1}
      />,
    );
    expect(screen.getByTestId('syllable-jamo-0')).toHaveAttribute('data-state', 'todo');
    vi.useRealTimers();
  });

  describe('오타 테두리', () => {
    afterEach(() => vi.useRealTimers());
    const card = () => screen.getByTestId('word-card');

    it('오타가 나면 테두리가 ERROR_FLASH_MS 동안 주황이었다가 돌아온다', () => {
      vi.useFakeTimers();
      const { rerender } = render(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={0} />);
      expect(card().className).toContain('border-[#36454d]');

      rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={1} />);
      expect(card().className).toContain('border-[#ff5e23]');
      expect(card().className).not.toContain('border-[#36454d]');

      act(() => vi.advanceTimersByTime(ERROR_FLASH_MS - 1));
      expect(card().className).toContain('border-[#ff5e23]');
      act(() => vi.advanceTimersByTime(1));
      expect(card().className).toContain('border-[#36454d]');
    });

    it('연달아 틀리면 마지막 오타부터 다시 ERROR_FLASH_MS 를 센다', () => {
      vi.useFakeTimers();
      const { rerender } = render(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={0} />);
      rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={1} />);
      // 첫 오타가 끝나기 직전에 또 틀린다
      act(() => vi.advanceTimersByTime(ERROR_FLASH_MS - 100));
      rerender(<WordCard word={word} typedJamoCount={1} index={1} total={10} errorCount={2} />);
      // 첫 오타 기준으로는 이미 끝났을 시점이지만 아직 주황이다
      act(() => vi.advanceTimersByTime(ERROR_FLASH_MS - 1));
      expect(card().className).toContain('border-[#ff5e23]');
      act(() => vi.advanceTimersByTime(1));
      expect(card().className).toContain('border-[#36454d]');
    });
  });

  it('영어 뜻이 없으면 생략한다', () => {
    render(<WordCard word={{ korean: '한글', english: null }} typedJamoCount={0} index={1} total={10} />);
    expect(screen.queryByTestId('word-english')).toBeNull();
  });
});
