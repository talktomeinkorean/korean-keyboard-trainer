import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncMarketingConsent, type ConsentStore } from './sync';

/** hasSynced 가 무엇을 돌려줄지 정해 두고, markSynced 호출을 기록하는 가짜 저장소 */
function fakeStore(synced: boolean) {
  const marked: string[] = [];
  const store: ConsentStore = {
    hasSynced: async () => synced,
    markSynced: async (email) => {
      marked.push(email);
    },
  };
  return { store, marked };
}

/** Kajabi 호출 자체는 여기서 관심 밖이라 결과만 정해 준다 */
function stubKajabi(result: 'sent' | 'failed' | 'skipped') {
  const fetchMock = vi.fn(async (url: string) => {
    if (String(url).includes('/oauth/token')) {
      return { ok: true, json: async () => ({ access_token: 't', expires_in: 3600 }) } as Response;
    }
    return result === 'sent'
      ? ({ ok: true, status: 201, json: async () => ({}) } as Response)
      : ({ ok: false, status: 500, text: async () => 'boom' } as Response);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const contact = { email: 'a@b.co', name: 'KIM TT' };

describe('syncMarketingConsent', () => {
  beforeEach(() => {
    vi.stubEnv('KAJABI_API_TOKEN', 'given-token');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('처음 넘기는 이메일이면 보내고 넘김 표시를 남긴다', async () => {
    const fetchMock = stubKajabi('sent');
    const { store, marked } = fakeStore(false);

    expect(await syncMarketingConsent(store, contact)).toBe('sent');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(marked).toEqual(['a@b.co']);
  });

  it('이미 넘긴 이메일이면 Kajabi 를 부르지 않는다', async () => {
    const fetchMock = stubKajabi('sent');
    const { store, marked } = fakeStore(true);

    expect(await syncMarketingConsent(store, contact)).toBe('already-sent');
    expect(fetchMock).not.toHaveBeenCalled();
    // 보내진 않아도 이 행에 표시는 남긴다 — 안 그러면 "아직 못 넘긴 사람" 질의에 잘못 걸린다
    expect(marked).toEqual(['a@b.co']);
  });

  it('넘기기에 실패하면 표시를 남기지 않는다 — 나중에 다시 보낼 수 있어야 한다', async () => {
    stubKajabi('failed');
    const { store, marked } = fakeStore(false);

    expect(await syncMarketingConsent(store, contact)).toBe('not-sent');
    expect(marked).toEqual([]);
  });

  it('환경 변수가 없어 건너뛴 경우에도 표시를 남기지 않는다', async () => {
    vi.stubEnv('KAJABI_API_TOKEN', '');
    vi.stubEnv('KAJABI_CLIENT_ID', '');
    vi.stubEnv('KAJABI_CLIENT_SECRET', '');
    stubKajabi('skipped');
    const { store, marked } = fakeStore(false);

    expect(await syncMarketingConsent(store, contact)).toBe('not-sent');
    expect(marked).toEqual([]);
  });
});
