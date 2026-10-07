import { getServiceClient } from '@/lib/supabase/server';
import { formatSlackMessage, reportWindow, type DailyReport, type ReportWindow } from '@/lib/report/daily';
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

  // ?date=today | yesterday | YYYY-MM-DD — 없으면 어제 (크론이 쓰는 기본값)
  const requested = new URL(request.url).searchParams.get('date');
  const window = reportWindow(new Date(), requested);
  if (!window) {
    return Response.json({ error: 'invalid date' }, { status: 400 });
  }

  try {
    const report = await collect(supabase, window);
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: formatSlackMessage(report, window.end) }),
    });
    if (!res.ok) {
      return Response.json({ error: 'slack failed', status: res.status }, { status: 502 });
    }
    return Response.json({ ok: true, date: report.date });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}

async function collect(supabase: SupabaseClient, window: ReportWindow): Promise<DailyReport> {
  /**
   * 세는 일은 저장소에 맡긴다 — 행을 받아와 세면 PostgREST 가 1000행에서 잘라
   * 그보다 많아지면 1000 에서 멈춘 숫자가 나온다.
   * 홈 방문자만 우리 DB 에 없어 GA4 에 묻는다 (설정이 없으면 null → 그 줄은 빠진다).
   */
  const [finishStats, scoreStats, visitors] = await Promise.all([
    supabase.from('race_finish_stats').select('finishes, participants').single(),
    supabase.from('race_score_stats').select('submissions, entrants, marketing_people').single(),
    homeVisitors(window.end),
  ]);

  return {
    date: window.date,
    homeVisitors: visitors,
    finishes: finishStats.data?.finishes ?? 0,
    participants: finishStats.data?.participants ?? 0,
    submissions: scoreStats.data?.submissions ?? 0,
    entrants: scoreStats.data?.entrants ?? 0,
    marketingPeople: scoreStats.data?.marketing_people ?? 0,
  };
}
