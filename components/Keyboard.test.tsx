import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keyboard } from './Keyboard';

describe('Keyboard', () => {
  it('기본 레이아웃: 자모 26 + 문장부호 2 + 스페이스 + Shift = 30키, 숫자열 없음', () => {
    const { container } = render(<Keyboard nextCode={null} />);
    expect(container.querySelectorAll('[data-kbd-key]')).toHaveLength(30);
    expect(screen.queryByTestId('kbd-key-Digit1')).toBeNull();
    expect(screen.getByTestId('kbd-key-Shift')).toBeInTheDocument();
  });

  it('확장 레이아웃: 숫자열 10 + 세미콜론/따옴표/물음표 키가 추가된다', () => {
    const { container } = render(<Keyboard nextCode={null} layout="extended" />);
    expect(container.querySelectorAll('[data-kbd-key]')).toHaveLength(43);
    expect(screen.getByTestId('kbd-key-Digit1')).toBeInTheDocument();
    expect(screen.getByTestId('kbd-key-Semicolon')).toBeInTheDocument();
    expect(screen.getByTestId('kbd-key-Quote')).toBeInTheDocument();
    expect(screen.getByTestId('kbd-key-Slash')).toBeInTheDocument();
  });

  it('시안 키캡 표기: 숫자는 1 에만 !, 문장부호는 윗글자를 크게 적는다 (1171:9048)', () => {
    render(<Keyboard nextCode={null} layout="extended" />);
    expect(screen.getByTestId('kbd-key-Digit1')).toHaveTextContent('1!');
    // 나머지 숫자키는 아랫글자가 없다 — 지금까지는 숫자를 한 번 더 적었다
    expect(screen.getByTestId('kbd-key-Digit2')).toHaveTextContent(/^2$/);
    expect(screen.getByTestId('kbd-key-Semicolon')).toHaveTextContent(':;');
    expect(screen.getByTestId('kbd-key-Quote')).toHaveTextContent('"\'');
    expect(screen.getByTestId('kbd-key-Slash')).toHaveTextContent(/^\?$/);
  });

  it('키 폭을 키에 직접 적는다 — 자모 34px, 문장 30px', () => {
    // CSS 변수를 거치면 그 변수가 비었을 때 키가 글자 폭으로 쪼그라든다
    const { rerender } = render(<Keyboard nextCode={null} />);
    expect(screen.getByTestId('kbd-key-KeyQ').className).toContain('w-[min(34px,');

    rerender(<Keyboard nextCode={null} layout="extended" />);
    expect(screen.getByTestId('kbd-key-KeyQ').className).toContain('w-[min(30px,');
  });

  // 모바일은 화면 키보드만 쓴다 — ? 는 키캡에 그것만 적혀 있고 / 는 연습에 안 나온다
  it('? 키는 탭만 해도 물음표로 입력된다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} layout="extended" onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-Slash'));
    expect(onKeyPress).toHaveBeenCalledWith('Slash', true);
  });

  // 나머지는 물리 자판 그대로 — ' " 는 둘 다 쓰이므로 Shift 를 눌러야 " 가 나온다
  it.each([
    ['kbd-key-Quote', 'Quote'],
    ['kbd-key-Semicolon', 'Semicolon'],
    ['kbd-key-Comma', 'Comma'],
    ['kbd-key-Digit1', 'Digit1'],
  ])('%s 는 Shift 없이 밑글자로 입력된다', (testId, code) => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} layout="extended" onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId(testId));
    expect(onKeyPress).toHaveBeenCalledWith(code, false);
  });

  it('Shift 를 켜고 누르면 윗글자로 입력된다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} layout="extended" onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-Shift'));
    fireEvent.click(screen.getByTestId('kbd-key-Quote'));
    expect(onKeyPress).toHaveBeenCalledWith('Quote', true);
  });

  it('nextCode 키에 강조 표시를 한다', () => {
    render(<Keyboard nextCode="KeyR" />);
    expect(screen.getByTestId('kbd-key-KeyR').className).toContain('bg-[#8ceb97]');
  });

  it('nextShift 면 Shift 키도 강조한다', () => {
    render(<Keyboard nextCode="KeyQ" nextShift />);
    expect(screen.getByTestId('kbd-key-Shift').className).toContain('bg-[#8ceb97]');
  });

  it('키를 탭하면 (code, shift=false) 로 onKeyPress 를 호출한다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-KeyR'));
    expect(onKeyPress).toHaveBeenCalledWith('KeyR', false);
  });

  it('Shift 토글: 키캡이 shift 문자로 바뀌고, 입력 후 자동 해제된다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);

    fireEvent.click(screen.getByTestId('kbd-key-Shift'));
    expect(screen.getByTestId('kbd-key-KeyQ')).toHaveTextContent('ㅃ');

    fireEvent.click(screen.getByTestId('kbd-key-KeyQ'));
    expect(onKeyPress).toHaveBeenCalledWith('KeyQ', true);
    // 자동 해제 — 키캡이 기본 문자로 복귀
    expect(screen.getByTestId('kbd-key-KeyQ')).toHaveTextContent('ㅂ');
  });

  it('스페이스바를 탭하면 Space code 로 호출한다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-Space'));
    expect(onKeyPress).toHaveBeenCalledWith('Space', false);
  });

  it('Key Guide 를 끄면 다음 키를 강조하지 않는다', () => {
    render(<Keyboard nextCode="KeyR" keyGuide={false} />);
    expect(screen.getByTestId('kbd-key-KeyR').className).not.toContain('bg-[#8ceb97]');
  });

  it('shift 키에 시안 아이콘을 쓴다 (유니코드 문자가 아님)', () => {
    render(<Keyboard nextCode={null} />);
    const arrow = screen.getByTestId('shift-arrow');
    expect(arrow).toHaveAttribute('src', '/race/icons/shift-arrow.svg');
    expect(screen.getByTestId('kbd-key-Shift')).not.toHaveTextContent('⇧');
  });
});