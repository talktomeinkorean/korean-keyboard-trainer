import { describe, it, expect } from 'vitest';
import { parseScoreSubmission } from './score';

const valid = {
  email: 'user@example.com',
  nickname: 'racer',
  timeMs: 15000,
  accuracy: 97,
};

describe('parseScoreSubmission', () => {
  it('올바른 제출을 통과시키고 닉네임을 trim 한다', () => {
    const r = parseScoreSubmission({ ...valid, nickname: '  racer  ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.nickname).toBe('racer');
  });

  it('이메일 형식이 아니면 거부한다', () => {
    expect(parseScoreSubmission({ ...valid, email: 'not-an-email' }).ok).toBe(false);
    expect(parseScoreSubmission({ ...valid, email: '' }).ok).toBe(false);
  });

  it('닉네임이 비었거나 20자를 넘으면 거부한다', () => {
    expect(parseScoreSubmission({ ...valid, nickname: '   ' }).ok).toBe(false);
    expect(parseScoreSubmission({ ...valid, nickname: 'a'.repeat(21) }).ok).toBe(false);
  });

  it('시간이 범위(3초~1시간) 밖이거나 정수가 아니면 거부한다', () => {
    expect(parseScoreSubmission({ ...valid, timeMs: 2999 }).ok).toBe(false);
    expect(parseScoreSubmission({ ...valid, timeMs: 3600001 }).ok).toBe(false);
    expect(parseScoreSubmission({ ...valid, timeMs: 15000.5 }).ok).toBe(false);
  });

  it('정확도가 0~100 정수가 아니면 거부한다', () => {
    expect(parseScoreSubmission({ ...valid, accuracy: -1 }).ok).toBe(false);
    expect(parseScoreSubmission({ ...valid, accuracy: 101 }).ok).toBe(false);
  });

  it('객체가 아니거나 필드 타입이 다르면 거부한다', () => {
    expect(parseScoreSubmission(null).ok).toBe(false);
    expect(parseScoreSubmission('str').ok).toBe(false);
    expect(parseScoreSubmission({ ...valid, timeMs: '15000' }).ok).toBe(false);
  });
});
