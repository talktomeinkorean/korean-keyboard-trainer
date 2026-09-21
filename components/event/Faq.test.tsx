import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Faq } from './Faq';

describe('Faq', () => {
  it('첫 항목(What can I win?)만 펼친 채로 시작한다', () => {
    render(<Faq />);
    const open = screen
      .getAllByRole('group')
      .filter((el) => (el as HTMLDetailsElement).open)
      .map((el) => el.querySelector('summary')?.textContent);
    expect(open).toEqual(['What can I win?']);
  });

  it('상품명이 상품 페이지 링크다', () => {
    render(<Faq />);
    const links = ['Bootcamp', 'Courses', 'Stories', 'Seyo'].map((name) =>
      screen.getByRole('link', { name }),
    );
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://ttmik.me/4y2eMdr',
      'https://ttmik.me/46EXbfA',
      'https://ttmikstories.onelink.me/Mj4f/wormuehx',
      'https://seyo.onelink.me/xicV/wir1spay',
    ]);
    // 새 탭으로 열되 원본 창을 넘겨주지 않는다
    links.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
