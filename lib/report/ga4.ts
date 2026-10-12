import { createSign } from 'node:crypto';

/**
 * GA4 에서 홈 방문자 수(누계)를 읽어 온다.
 *
 * 방문은 서버에 남기지 않고 GTM → GA4 로만 들어가므로, 숫자는 GA4 에 물어봐야 한다.
 * 서비스 계정으로 토큰을 받아 Data API 를 한 번 부른다 — 하루 한 번이라 라이브러리 없이
 * 직접 서명한다 (의존성을 늘리지 않으려는 것이다).
 *
 * 환경 변수가 비어 있으면 null — 리포트는 그 줄만 빼고 나간다.
 * 필요한 값: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY
 */

/** 집계 시작일 — 이벤트 시작일(2026-10-01)부터 센다 */
const START_DATE = '2026-10-01';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

/** 서비스 계정 키로 서명한 JWT 를 토큰으로 바꾼다 */
async function accessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  // 환경 변수에 한 줄로 넣으면 줄바꿈이 \n 문자열로 들어온다
  const jwt = `${header}.${claim}.${signer.sign(privateKey.replace(/\\n/g, '\n'), 'base64url')}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`google token ${res.status}`);
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) throw new Error('google token: no access_token');
  return body.access_token;
}

/** 운영 주소 — 미리보기 배포(*.vercel.app)도 운영 빌드라 GA4 로 들어오므로 주소로 거른다 */
const HOST = 'hangeultyping.talktomeinkorean.com';

const exact = (fieldName: string, value: string) => ({
  filter: { fieldName, stringFilter: { matchType: 'EXACT', value } },
});

/** https://hangeultyping.talktomeinkorean.com/ — 화면이 바뀌어도(10/12 이후 타자연습 목록) 이 주소를 센다 */
const HOME = [exact('hostName', HOST), exact('pagePath', '/')];

export interface HomeVisitors {
  /** 홈을 본 사람 — 같은 사람이 여러 번 와도 한 명 */
  total: number;
  /**
   * 그중 재방문자 — GA4 의 newVsReturning=returning. 첫 세션이 아닌 세션에서 홈을 본 사람이다.
   * 기준은 브라우저(쿠키)라 기기를 바꾸면 새 사람이다. 읽지 못하면 null.
   */
  returning: number | null;
}

/** 조건에 맞는 사람 수 (totalUsers) */
async function countUsers(
  propertyId: string,
  token: string,
  until: Date,
  expressions: ReturnType<typeof exact>[],
): Promise<number> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: START_DATE, endDate: until.toISOString().slice(0, 10) }],
        metrics: [{ name: 'totalUsers' }],
        dimensionFilter: { andGroup: { expressions } },
      }),
    },
  );
  if (!res.ok) {
    // 403 이면 대개 서비스 계정을 GA4 속성에 뷰어로 추가하지 않은 것이다
    throw new Error(`runReport ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const body = (await res.json()) as { rows?: { metricValues?: { value?: string }[] }[] };
  const value = body.rows?.[0]?.metricValues?.[0]?.value;
  return value === undefined ? 0 : Number(value);
}

/**
 * 홈을 본 사람 수와 그중 재방문자 — 누계.
 * 설정이 없으면 null, 호출이 실패해도 null 로 두어 리포트 전체가 막히지 않게 한다.
 * 재방문자만 실패하면 그 숫자만 null 이다.
 */
export async function homeVisitors(until: Date): Promise<HomeVisitors | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY;
  if (!propertyId || !clientEmail || !privateKey) {
    // 어느 값이 비었는지 Vercel 로그에서 보고 고칠 수 있게 남긴다 (값 자체는 찍지 않는다)
    const missing = [
      !propertyId && 'GA4_PROPERTY_ID',
      !clientEmail && 'GA4_CLIENT_EMAIL',
      !privateKey && 'GA4_PRIVATE_KEY',
    ].filter(Boolean);
    console.warn(`[report] GA4 설정 없음 — ${missing.join(', ')}`);
    return null;
  }

  try {
    const token = await accessToken(clientEmail, privateKey);
    const [total, returning] = await Promise.allSettled([
      countUsers(propertyId, token, until, HOME),
      countUsers(propertyId, token, until, [...HOME, exact('newVsReturning', 'returning')]),
    ]);
    if (total.status === 'rejected') throw total.reason;
    if (returning.status === 'rejected') {
      console.warn(`[report] GA4 재방문자 실패: ${String(returning.reason)}`);
    }
    return {
      total: total.value,
      returning: returning.status === 'fulfilled' ? returning.value : null,
    };
  } catch (e) {
    // 키 형식이 깨졌거나 토큰 발급이 막힌 경우 — 나머지 숫자는 그대로 보낸다
    console.warn(`[report] GA4 실패: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}
