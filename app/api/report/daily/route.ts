import { getServiceClient } from '@/lib/supabase/server';
import { formatSlackMessage, kstDateOf, type DailyReport } from '@/lib/report/daily';
import { homeVisitors } from '@/lib/report/ga4';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 하루 참여 리포트를 슬랙으로 보낸다. Vercel Cron 이 매일 00:00 UTC(=09:00 KST)에 호출한다.
 *
 * 주소가 알려지면 누구나 리포트를 띄울 수 있으므로 CRON_SECRET 으로 호출자를 확인한다
 * (Vercel Cron 은 Authorization: Bearer <CRON_SECRET> 를 자동으로 붙인다).
 * 슬랙 웹훅과 비밀값은 환경 변수로만 받는다 — 저장소에 두지 않는다.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const webhook = process.env.SLACK_WEBHOOK_URL;
  const supabase = getServiceClient();
  if (!webhook || !supabase) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }

  // 누계만 보내므로 집계 구간이 없다 — 언제나 '지금까지'다
  const now = new Date();

  try {
    const report = await collect(supabase, now);
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: formatSlackMessage(report, now) }),
    });
    if (!res.ok) {
      return Response.json({ error: 'slack failed', status: res.status }, { status: 502 });
    }
    // homeVisitors 를 함께 돌려준다 — 수동 실행으로 GA4 연결 여부를 바로 확인할 수 있다
    return Response.json({ ok: true, date: report.date, homeVisitors: report.homeVisitors });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}

async function collect(supabase: SupabaseClient, now: Date): Promise<DailyReport> {
  /**
   * 세는 일은 저장소에 맡긴다 — 행을 받아와 세면 PostgREST 가 1000행에서 잘라
   * 그보다 많아지면 1000 에서 멈춘 숫자가 나온다.
   * 홈 방문자만 우리 DB 에 없어 GA4 에 묻는다 (설정이 없으면 null → 그 줄은 빠진다).
   */
  const [finishStats, scoreStats, visitors] = await Promise.all([
    supabase.from('race_finish_stats').select('finishes, participants').single(),
    supabase.from('race_score_stats').select('submissions, entrants, marketing_people').single(),
    homeVisitors(now),
  ]);

  return {
    date: kstDateOf(now),
    homeVisitors: visitors,
    finishes: finishStats.data?.finishes ?? 0,
    participants: finishStats.data?.participants ?? 0,
    submissions: scoreStats.data?.submissions ?? 0,
    entrants: scoreStats.data?.entrants ?? 0,
    marketingPeople: scoreStats.data?.marketing_people ?? 0,
  };
}
