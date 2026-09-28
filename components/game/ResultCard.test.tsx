import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard } from './ResultCard';

describe('ResultCard', () => {
  it('기록을 시안 표기로 보여준다', () => {
    render(<ResultCard timeMs={33_120} />);
    expect(screen.getByTestId('result-time')).toHaveTextContent('00:33.12');
  });

  // 시안 1572:11285 에서 분당 타수가 빠지고 "My Time" 만 남았다
  it('분당 타수는 카드에 싣지 않는다', () => {
    render(<ResultCard timeMs={33_120} />);
    expect(screen.queryByTestId('result-speed')).toBeNull();
    expect(screen.getByTestId('result-card')).not.toHaveTextContent('keys/min');
  });

  it('기록에 맞는 등급과 문구를 보여준다', () => {
    render(<ResultCard timeMs={33_120} />);
    // 이모지는 윗줄이 아니라 아랫줄 영어 이름 앞에 붙는다
    expect(screen.getByTestId('result-rank')).toHaveTextContent('토끼 Tokki');
    expect(screen.getByTestId('result-rank')).toHaveTextContent('🐇 Rabbit');
    expect(screen.getByTestId('result-message')).toHaveTextContent(
      'You hopped through Seoul with ease.',
    );
  });

  it('다음 등급 목표를 안내한다', () => {
    render(<ResultCard timeMs={33_120} />);
    expect(screen.getByTestId('result-goal')).toHaveTextContent(
      'Beat 00:28.00 to reach 사슴 (deer)!',
    );
  });

  it('최고 등급이면 목표 대신 축하 문구를 보여준다', () => {
    render(<ResultCard timeMs={9_000} />);
    expect(screen.getByTestId('result-rank')).toHaveTextContent('타자왕 Tajawang');
    expect(screen.getByTestId('result-rank')).toHaveTextContent('👑 Typing King');
    expect(screen.getByTestId('result-goal')).toHaveTextContent('Top rank reached!');
  });

  it('가장 느린 구간이면 달팽이가 된다', () => {
    render(<ResultCard timeMs={90_000} />);
    expect(screen.getByTestId('result-rank')).toHaveTextContent('달팽이 Dalpaengi');
    expect(screen.getByTestId('result-rank')).toHaveTextContent('🐌 Snail');
  });
});

describe('ResultCard — 폴라로이드 사진', () => {
  it('뛴 배경과 같은 장소를 쓴다', () => {
    render(<ResultCard timeMs={33_120} backgroundId="uljiro" />);
    expect(screen.getByTestId('result-place')).toHaveAttribute('src', '/race/result-uljiro.png');
  });

  it('등급에 맞는 캐릭터를 세운다', () => {
    render(<ResultCard timeMs={33_120} backgroundId="gwanghwamun" />);
    expect(screen.getByTestId('result-animal')).toHaveAttribute('src', '/race/rabbit.png');

    // 등급이 바뀌면 캐릭터도 바뀐다
    render(<ResultCard timeMs={9_000} backgroundId="gwanghwamun" />);
    expect(screen.getAllByTestId('result-animal')[1]).toHaveAttribute('src', '/race/king.png');
  });

  it('배경을 모르면(공유 링크) 기본 장소로 그린다', () => {
    render(<ResultCard timeMs={33_120} />);
    expect(screen.getByTestId('result-place')).toHaveAttribute('src', '/race/result-hanriver.png');
  });
});
