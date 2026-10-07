-- 누계 리포트용 집계 뷰 (2026-10-07)
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.
--
-- 리포트가 "응모자 수"와 "마케팅 동의자 수"를 사람 수로 세기 위한 것이다.
-- 행을 받아와 세면 PostgREST 가 1000행에서 자르므로 DB 에서 세어 한 줄로 돌려준다.
create or replace view race_score_stats with (security_invoker = true) as
  select
    count(*)::int                                            as submissions,
    count(distinct email)::int                               as entrants,
    count(*) filter (where consent_marketing)::int           as marketing_submissions,
    count(distinct email) filter (where consent_marketing)::int as marketing_people
  from race_scores;

revoke all on race_score_stats from anon, authenticated;
