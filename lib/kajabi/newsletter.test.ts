import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** 모듈 안에 토큰 캐시가 있어서 테스트마다 새로 불러온다 */
async function loadModule() {
  vi.resetModules();
  return import('./newsletter');
}

function tokenResponse(expiresIn?: number) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ access_token: 'tok-1', expires_in: expiresIn }),
  } as Response;
}

const created = { ok: true, status: 201, json: async () => ({}) } as Response;

/** 토큰 요청과 폼 제출을 구분해서 응답하는 fetch 스텁 */
function stubFetch(submit: () => Response, token: () => Response = () => tokenResponse(3600)) {
  const fetchMock = vi.fn(async (url: string) =>
    String(url).includes('/oauth/token') ? token() : submit(),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('subscribeToNewsletter', () => {
  beforeEach(() => {
    // 실행 환경에 토큰이 들어 있어도 이 블록은 OAuth 경로를 본다
    vi.stubEnv('KAJABI_API_TOKEN', '');
    vi.stubEnv('KAJABI_CLIENT_ID', 'id-1');
    vi.stubEnv('KAJABI_CLIENT_SECRET', 'secret-1');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('환경 변수가 없으면 아무것도 보내지 않는다 — 로컬·프리뷰에서 실제 구독이 생기면 안 된다', async () => {
    vi.stubEnv('KAJABI_CLIENT_ID', '');
    const fetchMock = stubFetch(() => created);
    const { subscribeToNewsletter } = await loadModule();

    expect(await subscribeToNewsletter({ name: 'KIM TT', email: 'a@b.co' })).toBe('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('문서대로 토큰을 받아 폼에 제출한다', async () => {
    const fetchMock = stubFetch(() => created);
    const { subscribeToNewsletter } = await loadModule();

    expect(await subscribeToNewsletter({ name: 'KIM TT', email: 'a@b.co' })).toBe('sent');

    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(tokenUrl).toBe('https://api.kajabi.com/v1/oauth/token');
    expect(String(tokenInit.body)).toContain('grant_type=client_credentials');

    const [submitUrl, submitInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(submitUrl).toBe('https://api.kajabi.com/v1/forms/2149717545/submit');
    expect((submitInit.headers as Record<string, string>).Authorization).toBe('Bearer tok-1');
    expect((submitInit.headers as Record<string, string>)['Content-Type']).toBe(
      'application/vnd.api+json',
    );
    expect(JSON.parse(String(submitInit.body))).toEqual({
      data: { type: 'form_submissions', attributes: { name: 'KIM TT', email: 'a@b.co' } },
    });
  });

  it('토큰을 캐시해 두 번째 제출에서는 다시 받지 않는다', async () => {
    const fetchMock = stubFetch(() => created);
    const { subscribeToNewsletter } = await loadModule();

    await subscribeToNewsletter({ name: 'A', email: 'a@b.co' });
    await subscribeToNewsletter({ name: 'B', email: 'b@b.co' });

    const tokenCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/oauth/token'));
    expect(tokenCalls).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('만료가 지나면 토큰을 새로 받는다', async () => {
    // expires_in 이 여유분(60초)보다 짧으면 캐시가 이미 만료된 상태다
    const fetchMock = stubFetch(() => created, () => tokenResponse(1));
    const { subscribeToNewsletter } = await loadModule();

    await subscribeToNewsletter({ name: 'A', email: 'a@b.co' });
    await subscribeToNewsletter({ name: 'B', email: 'b@b.co' });

    const tokenCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/oauth/token'));
    expect(tokenCalls).toHaveLength(2);
  });

  it('401 이면 토큰을 새로 받아 한 번 다시 보낸다 — 키를 교체한 경우', async () => {
    let attempt = 0;
    const fetchMock = stubFetch(() => {
      attempt += 1;
      return attempt === 1
        ? ({ ok: false, status: 401, text: async () => 'expired' } as Response)
        : created;
    });
    const { subscribeToNewsletter } = await loadModule();

    expect(await subscribeToNewsletter({ name: 'A', email: 'a@b.co' })).toBe('sent');
    const tokenCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/oauth/token'));
    expect(tokenCalls).toHaveLength(2);
  });

  it('제출이 실패하면 failed 를 돌려주고 예외는 던지지 않는다', async () => {
    stubFetch(() => ({ ok: false, status: 422, text: async () => 'bad email' }) as Response);
    const { subscribeToNewsletter } = await loadModule();

    expect(await subscribeToNewsletter({ name: 'A', email: 'nope' })).toBe('failed');
  });

  it('네트워크가 끊겨도 예외는 던지지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNRESET'); }));
    const { subscribeToNewsletter } = await loadModule();

    expect(await subscribeToNewsletter({ name: 'A', email: 'a@b.co' })).toBe('failed');
  });
});

// Public API 키 발급 권한(Owner·Subowner)이 없는 동안 쓰는 임시 경로
describe('subscribeToNewsletter — 토큰을 직접 넣은 경우', () => {
  beforeEach(() => {
    vi.stubEnv('KAJABI_API_TOKEN', 'given-token');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('토큰 발급을 건너뛰고 그대로 쓴다', async () => {
    const fetchMock = stubFetch(() => created);
    const { subscribeToNewsletter } = await loadModule();

    expect(await subscribeToNewsletter({ name: 'A', email: 'a@b.co' })).toBe('sent');
    expect(fetchMock).toHaveBeenCalledTimes(1); // 토큰 요청 없음
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.kajabi.com/v1/forms/2149717545/submit');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer given-token');
  });

  it('client_id·secret 이 함께 있어도 직접 넣은 토큰이 우선이다', async () => {
    vi.stubEnv('KAJABI_CLIENT_ID', 'id-1');
    vi.stubEnv('KAJABI_CLIENT_SECRET', 'secret-1');
    const fetchMock = stubFetch(() => created);
    const { subscribeToNewsletter } = await loadModule();

    await subscribeToNewsletter({ name: 'A', email: 'a@b.co' });
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/oauth/token'))).toBe(false);
  });

  it('401 이면 재발급을 시도하지 않고, 무엇을 해야 하는지 로그에 남긴다', async () => {
    const fetchMock = stubFetch(
      () => ({ ok: false, status: 401, text: async () => 'expired' }) as Response,
    );
    const { subscribeToNewsletter } = await loadModule();

    expect(await subscribeToNewsletter({ name: 'A', email: 'a@b.co' })).toBe('failed');
    // 갱신할 방법이 없으므로 토큰 요청도 재시도도 하지 않는다
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.mocked(console.error).mock.calls[0][0]).toContain('KAJABI_CLIENT_ID');
  });
});
