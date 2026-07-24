import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 서버 전용 Supabase 클라이언트 (service role — RLS 우회).
 * 라우트 핸들러에서만 import 할 것. 클라이언트 번들에 포함 금지.
 * 환경 변수 미설정이면 null — 호출부는 503으로 응답한다.
 */
export function getServiceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
