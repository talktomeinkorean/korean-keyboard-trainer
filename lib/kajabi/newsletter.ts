/**
 * Kajabi 뉴스레터 구독 — 기록 저장 폼의 (Optional) 동의에 체크한 사람만 보낸다.
 *
 * 문서: https://help.kajabi.com/api-reference/forms/submit-form
 *
 * 인증에 쓸 토큰을 얻는 길이 두 가지고, 둘 다 지원한다.
 *  1. KAJABI_API_TOKEN — 이미 발급받은 액세스 토큰을 그대로 쓴다. 스스로 갱신하지 못해서
 *     만료되면 연동이 멈춘다. Public API 키 발급 권한(Owner·Subowner)이 없을 때의 임시 방편이다.
 *  2. KAJABI_CLIENT_ID / KAJABI_CLIENT_SECRET — 만료 전에 토큰을 스스로 새로 받는다. 이쪽이 정석이다.
 * 1번이 있으면 1번을 쓴다. 권한이 생기면 KAJABI_API_TOKEN 을 지우기만 하면 2번으로 넘어간다.
 *
 * 실패해도 예외를 밖으로 던지지 않는다. 이 호출이 일어나는 시점에는 기록이 이미
 * Supabase 에 저장돼 있고 consent_marketing 도 남아 있어서, 나중에 다시 밀어 넣을 수 있다.
 * 대신 원인을 알 수 있게 로그는 남긴다.
 */

/** 마케팅 동의자를 담을 Kajabi 폼 */
const FORM_ID = '2149717545';
const TOKEN_URL = 'https://api.kajabi.com/v1/oauth/token';
const SUBMIT_URL = `https://api.kajabi.com/v1/forms/${FORM_ID}/submit`;

/** 만료 직전에 쓰다가 401 을 맞지 않도록 1분 일찍 새로 받는다 */
const EXPIRY_MARGIN_MS = 60_000;
/** 문서에 만료 시간이 없다 — 응답의 expires_in 이 없을 때만 쓰는 보수적인 값 */
const FALLBACK_TTL_S = 1800;

let cachedToken: { value: string; expiresAt: number } | null = null;

export type SubscribeResult = 'sent' | 'skipped' | 'failed';

type Credentials =
  | { kind: 'token'; token: string }
  | { kind: 'oauth'; clientId: string; clientSecret: string };

/** 환경 변수에서 인증 수단을 고른다. 아무것도 없으면 null — 호출을 건너뛴다. */
function readCredentials(): Credentials | null {
  const token = process.env.KAJABI_API_TOKEN;
  if (token) return { kind: 'token', token };
  const clientId = process.env.KAJABI_CLIENT_ID;
  const clientSecret = process.env.KAJABI_CLIENT_SECRET;
  if (clientId && clientSecret) return { kind: 'oauth', clientId, clientSecret };
  return null;
}

async function fetchToken(clientId: string, clientSecret: string): Promise<string | null> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) {
    console.error(`[kajabi] 토큰 발급 실패 ${res.status}: ${await res.text()}`);
    return null;
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    console.error('[kajabi] 토큰 응답에 access_token 이 없다');
    return null;
  }
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? FALLBACK_TTL_S) * 1000 - EXPIRY_MARGIN_MS,
  };
  return cachedToken.value;
}

async function getToken(clientId: string, clientSecret: string): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  return fetchToken(clientId, clientSecret);
}

async function postSubmission(token: string, name: string, email: string): Promise<Response> {
  return fetch(SUBMIT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: { type: 'form_submissions', attributes: { name, email } },
    }),
  });
}

/**
 * 뉴스레터 폼에 이름·이메일을 넣는다.
 * 인증 환경 변수가 없으면 아무것도 하지 않는다 ('skipped') — 로컬·프리뷰에서 실제 구독이 생기면 안 된다.
 */
export async function subscribeToNewsletter(input: {
  name: string;
  email: string;
}): Promise<SubscribeResult> {
  const creds = readCredentials();
  if (!creds) return 'skipped';

  try {
    const token =
      creds.kind === 'token'
        ? creds.token
        : await getToken(creds.clientId, creds.clientSecret);
    if (!token) return 'failed';

    let res = await postSubmission(token, input.name, input.email);
    if (res.status === 401) {
      if (creds.kind === 'token') {
        // 직접 넣은 토큰은 갱신할 방법이 없다. 무엇을 해야 하는지 로그에 그대로 적는다.
        console.error(
          '[kajabi] 토큰이 거부됐다(401). KAJABI_API_TOKEN 은 만료되면 되살릴 수 없다 — ' +
            'Settings > Public API 에서 키를 발급해 KAJABI_CLIENT_ID/KAJABI_CLIENT_SECRET 로 바꿔야 한다.',
        );
        return 'failed';
      }
      // 키를 교체했거나 캐시한 토큰이 먼저 죽은 경우 — 한 번만 새로 받아 다시 보낸다
      cachedToken = null;
      const fresh = await fetchToken(creds.clientId, creds.clientSecret);
      if (!fresh) return 'failed';
      res = await postSubmission(fresh, input.name, input.email);
    }

    if (!res.ok) {
      console.error(`[kajabi] 구독 실패 ${res.status}: ${await res.text()}`);
      return 'failed';
    }
    return 'sent';
  } catch (error) {
    console.error('[kajabi] 구독 중 예외', error);
    return 'failed';
  }
}
