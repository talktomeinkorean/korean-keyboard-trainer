import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Coachmark } from './Coachmark';

/** 코치마크가 구멍을 뚫을 대상들 — 실제 화면에 있는 것과 같은 표식 */
function renderWithTargets() {
  return render(
    <>
      <p>
        <span data-testid="word-typed">한</span>
        <span>글</span>
      </p>
      <div>
        <span data-testid="syllable-jamo-0">ㅎ</span>
      </div>
      <div data-testid="race-keyboard-block" />
      <Coachmark onClose={() => {}} />
    </>,
  );
}

function holeCount(): number {
  const d = screen.getByTestId('coachmark-scrim').querySelector('path')!.getAttribute('d')!;
  // 첫 M 은 화면 전체를 덮는 사각형, 나머지가 구멍이다
  return d.split('M').length - 2;
}

describe('Coachmark', () => {
  it('단어·자모 칩·키보드 자리에 구멍을 뚫는다', () => {
    renderWithTargets();
    expect(holeCount()).toBe(3);
  });

  it('시안의 안내 문구 네 줄을 보여준다', () => {
    renderWithTargets();
    // 스크린 리더용 요약(sr-only)에도 같은 문장이 있어 문단만 골라 본다
    const lines = [...document.querySelectorAll('[data-testid="coachmark"] p')].map(
      (p) => p.textContent ?? '',
    );
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('Type this word');
    expect(lines[1]).toContain('A hint if you need it');
    expect(lines[2]).toContain('tap the first letter or press it');
    expect(lines[3]).toBe('Tap anywhere to continue');
  });

  it('대상이 아직 없으면 구멍 없이 막만 깐다 (터지지 않는다)', () => {
    render(<Coachmark onClose={() => {}} />);
    expect(holeCount()).toBe(0);
    expect(screen.queryByText('Type this word')).toBeNull();
  });

  it('아무 데나 누르면 닫는다', () => {
    const onClose = vi.fn();
    render(<Coachmark onClose={onClose} />);
    fireEvent.click(screen.getByTestId('coachmark'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
