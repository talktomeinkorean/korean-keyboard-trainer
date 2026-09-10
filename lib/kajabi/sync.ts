import { subscribeToNewsletter } from './newsletter';

/**
 * 한 이메일을 Kajabi 에 한 번만 넘기기 위한 저장소.
 *
 * 이 동기화가 쓰는 두 질의만 추려 두었다 — 라우트가 Supabase 로 구현하고,
 * 테스트는 가짜 구현을 끼운다.
 */
export interface ConsentStore {
  /** 이 이메일을 Kajabi 에 넘긴 적이 있나 (kajabi_synced_at 이 찍힌 행이 있나) */
  hasSynced(email: string): Promise<boolean>;
  /** 이 이메일의 아직 못 넘긴 동의 행들에 넘긴 시각을 찍는다 */
  markSynced(email: string): Promise<void>;
}

export type SyncResult = 'sent' | 'already-sent' | 'not-sent';

/**
 * 마케팅 동의자를 Kajabi 뉴스레터로 넘긴다. 이미 넘긴 이메일이면 아무것도 하지 않는다.
 *
 * 판단 기준은 "이 이메일로 제출한 적 있나" 가 아니라 "이 이메일을 넘긴 적 있나" 다.
 * 한 사람이 여러 판을 제출하면서 (Optional) 체크를 껐다 켰다 할 수 있어서,
 * 제출 이력으로 세면 처음 체크한 판을 놓친다.
 *
 * 넘기기에 실패하면 시각을 찍지 않는다 — 그 행이 null 로 남아 나중에 다시 보낼 대상이 된다.
 */
export async function syncMarketingConsent(
  store: ConsentStore,
  contact: { email: string; name: string },
): Promise<SyncResult> {
  if (await store.hasSynced(contact.email)) {
    // 보내지는 않지만 이 행에도 시각을 찍는다. 안 찍으면 이미 Kajabi 에 있는 사람의
    // 이후 제출이 계속 null 로 쌓여서, "아직 못 넘긴 사람" 질의에 잘못 걸린다.
    await store.markSynced(contact.email);
    return 'already-sent';
  }

  const result = await subscribeToNewsletter(contact);
  if (result !== 'sent') return 'not-sent';

  await store.markSynced(contact.email);
  return 'sent';
}
