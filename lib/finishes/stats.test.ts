import { describe, it, expect, vi, afterEach } from 'vitest';
import { getRunnerCount } from './stats';

describe('getRunnerCount', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('저장소가 설정되지 않았으면 null — 홈 화면이 가짜 숫자 대신 "-" 를 보인다', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    expect(await getRunnerCount()).toBeNull();
  });
});
