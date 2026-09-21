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
});
