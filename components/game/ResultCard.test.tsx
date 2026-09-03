import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard } from './ResultCard';

describe('ResultCard', () => {
  it('기록을 시안 표기로 보여준다', () => {
    render(<ResultCard timeMs={33_120} keysPerMin={112} />);
    expect(screen.getByTestId('result-time')).toHaveTextContent('00:33.12');
    expect(screen.getByTestId('result-speed')).toHaveTextContent('112 keys/min');
  });

  it('기록에 맞는 등급과 문구를 보여준다', () => {
    render(<ResultCard timeMs={33_120} keysPerMin={112} />);
    expect(screen.getByTestId('result-rank')).toHaveTextContent('🐇 토끼 Tokki');
    expect(screen.getByTestId('result-rank')).toHaveTextContent('Rabbit');
    expect(screen.getByTestId('result-message')).toHaveTextContent(
      'You hopped through Seoul with ease.',
    );
  });

  it('다음 등급 목표를 안내한다', () => {
    render(<ResultCard timeMs={33_120} keysPerMin={112} />);
    expect(screen.getByTestId('result-goal')).toHaveTextContent(
      'Beat 00:28.00 to reach 사슴 (deer)!',
    );
  });

  it('최고 등급이면 목표 대신 축하 문구를 보여준다', () => {
    render(<ResultCard timeMs={9_000} keysPerMin={400} />);
    expect(screen.getByTestId('result-rank')).toHaveTextContent('👑 타자왕 Tajawang');
    expect(screen.getByTestId('result-goal')).toHaveTextContent('Top rank reached!');
  });

  it('가장 느린 구간이면 달팽이가 된다', () => {
    render(<ResultCard timeMs={90_000} keysPerMin={40} />);
    expect(screen.getByTestId('result-rank')).toHaveTextContent('🐌 달팽이 Dalpaengi');
  });
});
