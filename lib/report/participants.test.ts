import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { countParticipants } from './participants';

/** PostgREST 처럼 한 번에 1000행까지만 돌려주는 가짜 저장소 */
function fakeSupabase(rows: { session_id: string | null }[]) {
  const pages: [number, number][] = [];
  const builder = {
    select: () => builder,
    gte: () => builder,
    lt: () => builder,
    order: () => builder,
    range: (start: number, end: number) => {
      pages.push([start, end]);
      // 1000행 상한 — 더 넓게 달라고 해도 그만큼만 준다
      return Promise.resolve({ data: rows.slice(start, Math.min(end + 1, start + 1000)), error: null });
    },
  };
  return { client: { from: () => builder } as unknown as SupabaseClient, pages };
}

const session = (n: number) => ({ session_id: `s${n}` });

describe('countParticipants', () => {
  it('1000명을 넘어도 끝까지 센다 — 한 번만 읽으면 1000 에서 멈춘다', async () => {
    const rows = Array.from({ length: 2500 }, (_, i) => session(i));
    const { client, pages } = fakeSupabase(rows);

    expect(await countParticipants(client, 'from', 'to')).toBe(2500);
    expect(pages.length).toBe(3); // 1000 + 1000 + 500
  });

  it('같은 브라우저의 여러 판은 한 명으로 센다', async () => {
    const rows = [session(1), session(1), session(2)];
    const { client } = fakeSupabase(rows);

    expect(await countParticipants(client, 'from', 'to')).toBe(2);
  });

  it('session_id 가 없던 옛 기록은 각각 센다 — 묶을 근거가 없다', async () => {
    const rows = [session(1), { session_id: null }, { session_id: null }];
    const { client } = fakeSupabase(rows);

    expect(await countParticipants(client, 'from', 'to')).toBe(3);
  });

  it('마지막 페이지가 꽉 찼으면 한 번 더 읽어 끝을 확인한다', async () => {
    const rows = Array.from({ length: 1000 }, (_, i) => session(i));
    const { client, pages } = fakeSupabase(rows);

    expect(await countParticipants(client, 'from', 'to')).toBe(1000);
    expect(pages.length).toBe(2);
  });
});
