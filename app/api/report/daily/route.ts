import { getServiceClient } from '@/lib/supabase/server';
import { formatSlackMessage, reportWindow, type DailyReport, type ReportWindow } from '@/lib/report/daily';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 하루 참여 리포트를 슬랙으로 보낸다. Vercel Cron 이 매일 00:00 UTC(=09:00 KST)에 호출한다.
 *
 * 주소가 알려지면 누구나 리포트를 띄울 수 있으므로 CRON_SECRET 으로 호출자를 확인한다
 * (Vercel Cron 은 Authorization: Bearer <CRON_SECRET> 를 자동으로 붙인다).
 * 슬랙 웹훅과 비밀값은 환경 변수로만 받는다 — 저장소에 두지 않는다.
 */
export const dynamic = 'force-dynamic';

/** 한 번에 읽어올 행 수 상한 — 하루치라 넉넉하다 */
const ROW_LIMIT = 10_000;

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
    return Response.json({ ok: true, date: report.date, partial: report.partial });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}

async function collect(supabase: SupabaseClient, window: ReportWindow): Promise<DailyReport> {
  const from = window.start.toISOString();
  const to = window.end.toISOString();

  const [finishRows, scoreRows, totalStats, totalSubmissions] = await Promise.all([
    supabase
      .from('race_finishes')
      .select('session_id')
      .gte('created_at', from)
      .lt('created_at', to)
      .limit(ROW_LIMIT),
    supabase
      .from('race_scores')
      .select('consent_marketing')
      .gte('created_at', from)
      .lt('created_at', to)
      .limit(ROW_LIMIT),
    supabase.from('race_finish_stats').select('finishes, participants').single(),
    supabase.from('race_scores').select('*', { count: 'exact', head: true }),
  ]);

  const finishes = finishRows.data ?? [];
  const scores = (scoreRows.data ?? []) as { consent_marketing: boolean }[];

  return {
    date: window.date,
    partial: window.partial,
    finishes: finishes.length,
    // 같은 브라우저의 여러 판은 한 명으로 센다 (session_id 가 없던 옛 기록은 각각 센다)
    participants: new Set(finishes.map((f, i) => f.session_id ?? `row-${i}`)).size,
    submissions: scores.length,
    newsletterOptIns: scores.filter((s) => s.consent_marketing).length,
    totals: {
      finishes: totalStats.data?.finishes ?? 0,
      participants: totalStats.data?.participants ?? 0,
      submissions: totalSubmissions.count ?? 0,
    },
  };
}
