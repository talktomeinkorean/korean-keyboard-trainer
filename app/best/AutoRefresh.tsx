'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** 대회 중 화면을 띄워 두기만 해도 순위가 갱신되도록 서버 데이터를 주기적으로 다시 받는다. */
export function AutoRefresh({ intervalMs }: { intervalMs: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
