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

/** 토큰 요청과 리포트 요청을 차례로 받는 fetch */
function stubFetch(report: unknown, reportOk = true) {
  const calls: { url: string; body: string }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: { body: string }) => {
      calls.push({ url: String(url), body: String(init.body) });
      if (String(url).includes('oauth2')) {
        return { ok: true, json: async () => ({ access_token: 'token' }) };
      }
      return { ok: reportOk, json: async () => report };
    }),
  );
  return calls;
}

describe('homeVisitors', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('이벤트 시작일(2026-10-01)부터 센다', async () => {
    configure();
    const calls = stubFetch({ rows: [{ metricValues: [{ value: '18402' }] }] });

    expect(await homeVisitors(new Date('2026-10-07T00:00:00Z'))).toBe(18402);

    const report = calls.find((c) => c.url.includes('runReport'))!;
    const body = JSON.parse(report.body);
    expect(body.dateRanges[0]).toEqual({ startDate: '2026-10-01', endDate: '2026-10-07' });
    // 홈(/)만 센다 — 연습·결과 화면은 빼야 한다
    expect(body.dimensionFilter.filter.stringFilter.value).toBe('/');
    expect(body.metrics[0].name).toBe('totalUsers');
  });

  it('설정이 없으면 부르지 않고 null 을 돌려준다', async () => {
    const calls = stubFetch({});
    expect(await homeVisitors(new Date())).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('GA4 가 실패해도 null 로 두어 리포트를 막지 않는다', async () => {
    configure();
    stubFetch({}, false);
    expect(await homeVisitors(new Date())).toBeNull();
  });
});
