import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { homeVisitors } from './ga4';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

function configure() {
  vi.stubEnv('GA4_PROPERTY_ID', '123456789');
  vi.stubEnv('GA4_CLIENT_EMAIL', 'report@example.iam.gserviceaccount.com');
  vi.stubEnv('GA4_PRIVATE_KEY', privateKey);
}

/** 조회 본문에서 조건 값만 뽑는다 — 어떤 조회인지 가리기 위해 */
function filterValues(body: string): string[] {
  const expressions = JSON.parse(body).dimensionFilter.andGroup.expressions;
  return expressions.map((e: { filter: { stringFilter: { value: string } } }) => e.filter.stringFilter.value);
}

/**
 * 토큰 요청과 리포트 요청을 받는 fetch.
 * 리포트는 홈 전체·재방문자 두 번 부르므로 재방문 조건이 있는지로 응답을 나눈다.
 */
function stubFetch(
  totals: { total: string; returning: string } = { total: '0', returning: '0' },
  ok: { total: boolean; returning: boolean } = { total: true, returning: true },
) {
  const calls: { url: string; body: string }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: { body: string }) => {
      calls.push({ url: String(url), body: String(init.body) });
      if (String(url).includes('oauth2')) {
        return { ok: true, json: async () => ({ access_token: 'token' }) };
      }
      const which = filterValues(String(init.body)).includes('returning') ? 'returning' : 'total';
      return {
        ok: ok[which],
        text: async () => 'denied',
        json: async () => ({ rows: [{ metricValues: [{ value: totals[which] }] }] }),
      };
    }),
  );
  return calls;
}

describe('homeVisitors', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('이벤트 시작일(2026-10-01)부터 홈 방문자와 재방문자를 센다', async () => {
    configure();
    const calls = stubFetch({ total: '18402', returning: '4210' });

    expect(await homeVisitors(new Date('2026-10-07T00:00:00Z'))).toEqual({
      total: 18402,
      returning: 4210,
    });

    const reports = calls.filter((c) => c.url.includes('runReport'));
    expect(reports).toHaveLength(2);
    for (const r of reports) {
      const body = JSON.parse(r.body);
      expect(body.dateRanges[0]).toEqual({ startDate: '2026-10-01', endDate: '2026-10-07' });
      expect(body.metrics[0].name).toBe('totalUsers');
    }
    // 운영 주소의 / 만 센다 — 미리보기 배포와 연습·결과 화면은 빼야 한다
    expect(filterValues(reports[0].body)).toEqual(['hangeultyping.talktomeinkorean.com', '/']);
    expect(filterValues(reports[1].body)).toEqual([
      'hangeultyping.talktomeinkorean.com',
      '/',
      'returning',
    ]);
  });

  it('재방문자만 실패하면 홈 방문자는 그대로 두고 재방문자만 null', async () => {
    configure();
    stubFetch({ total: '18402', returning: '0' }, { total: true, returning: false });
    expect(await homeVisitors(new Date())).toEqual({ total: 18402, returning: null });
  });

  it('설정이 없으면 부르지 않고 null 을 돌려준다', async () => {
    const calls = stubFetch();
    expect(await homeVisitors(new Date())).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('GA4 가 실패해도 null 로 두어 리포트를 막지 않는다', async () => {
    configure();
    stubFetch(undefined, { total: false, returning: false });
    expect(await homeVisitors(new Date())).toBeNull();
  });
});
