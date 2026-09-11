/**
 * Kajabi 뉴스레터 구독 — 기록 저장 폼의 (Optional) 동의에 체크한 사람만 보낸다.
 *
 * 문서: https://help.kajabi.com/api-reference/forms/submit-form
 *
 * 인증은 OAuth2 client_credentials 다. KAJABI_CLIENT_ID / KAJABI_CLIENT_SECRET 로 토큰을 받아
 * 캐시하고 만료 전에 새로 받는다. 값은 Kajabi 대시보드의 Settings > Public API 에서 발급한다
 * (Owner·Subowner 만 발급 가능).
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
  const clientId = process.env.KAJABI_CLIENT_ID;
  const clientSecret = process.env.KAJABI_CLIENT_SECRET;
  if (!clientId || !clientSecret) return 'skipped';

  try {
    const token = await getToken(clientId, clientSecret);
    if (!token) return 'failed';

    let res = await postSubmission(token, input.name, input.email);
    // 키를 교체했거나 캐시한 토큰이 먼저 죽은 경우 — 한 번만 새로 받아 다시 보낸다
    if (res.status === 401) {
      cachedToken = null;
      const fresh = await fetchToken(clientId, clientSecret);
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
