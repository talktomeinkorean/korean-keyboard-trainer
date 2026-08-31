'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Props {
  timeMs: number;
  accuracy: number;
  onRetry: () => void;
}

interface LeaderboardEntry {
  nickname: string;
  timeMs: number;
}

type SubmitState =
  | { step: 'form' }
  | { step: 'submitting' }
  | { step: 'done'; bestMs: number; rank: number }
  | { step: 'error' };

const PLAYER_KEY = 'race-player';

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}

function loadPlayer(): { email: string; nickname: string } {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* 무시 — 손상된 저장값은 빈 값으로 대체 */
  }
  return { email: '', nickname: '' };
}

export function RaceResultCard({ timeMs, accuracy, onRetry }: Props) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [state, setState] = useState<SubmitState>({ step: 'form' });
  // 동의는 매번 새로 받는다 (저장했다가 자동 체크하면 동의 기록의 의미가 없다)
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  // null = 로딩/미설정(저장 기능 숨김), [] = 아직 기록 없음
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [scoringEnabled, setScoringEnabled] = useState(false);

  useEffect(() => {
    const saved = loadPlayer();
    setEmail(saved.email);
    setNickname(saved.nickname);

    void fetch('/api/leaderboard')
      .then(async (res) => {
        if (!res.ok) return; // 503(미설정) 등 — 저장 UI 숨김 유지
        const data = (await res.json()) as { entries: LeaderboardEntry[] };
        setLeaderboard(data.entries);
        setScoringEnabled(true);
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ step: 'submitting' });
    try {
      localStorage.setItem(PLAYER_KEY, JSON.stringify({ email, nickname }));
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nickname,
          timeMs,
          accuracy,
          consentRequired,
          consentMarketing,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { bestMs: number; rank: number };
      setState({ step: 'done', bestMs: data.bestMs, rank: data.rank });
      // 제출 직후에는 캐시를 우회해 방금 저장한 기록이 바로 보이게 한다
      const lb = await fetch('/api/leaderboard?fresh=1');
      if (lb.ok) setLeaderboard(((await lb.json()) as { entries: LeaderboardEntry[] }).entries);
    } catch {
      setState({ step: 'error' });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl p-8 w-96 max-w-[calc(100vw-2rem)] text-center flex flex-col gap-4 text-white">
        <h2 className="text-2xl font-semibold">Finished! 🏁</h2>
        <div>
          <b className="block text-4xl text-blue-400 tabular-nums">{formatSeconds(timeMs)}s</b>
          <span className="text-sm text-neutral-400">accuracy {accuracy}%</span>
        </div>

        {scoringEnabled && state.step !== 'done' && (
          <form onSubmit={submit} className="flex flex-col gap-2 text-left">
            <input
              type="text"
              required
              maxLength={20}
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="rounded-lg bg-neutral-800 px-3 py-2 text-sm"
            />
            <input
              type="email"
              required
              placeholder="Email (not shown publicly)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-neutral-800 px-3 py-2 text-sm"
            />
            <label className="flex items-start gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                required
                data-testid="consent-required"
                checked={consentRequired}
                onChange={(e) => setConsentRequired(e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <span>
                (Required) I agree to have my name and email collected for the Hangeul Day
                drawing.
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                data-testid="consent-marketing"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <span>
                (Optional) I&apos;d love to receive Korean learning tips and exclusive discounts
                from TTMIK!
              </span>
            </label>
            <button
              type="submit"
              disabled={state.step === 'submitting' || !consentRequired}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {state.step === 'submitting' ? 'Saving…' : 'Save my score'}
            </button>
            {state.step === 'error' && (
              <p className="text-xs text-red-400">Failed to save. Please try again.</p>
            )}
          </form>
        )}

        {state.step === 'done' && (
          <p className="text-emerald-400">
            Your best: {formatSeconds(state.bestMs)}s · Rank #{state.rank}
          </p>
        )}

        {leaderboard !== null && (
          <div className="text-left">
            <h3 className="text-sm text-neutral-400 mb-1">Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-neutral-500">No records yet — be the first!</p>
            ) : (
              <ol className="text-sm flex flex-col gap-0.5">
                {leaderboard.map((entry, i) => (
                  <li key={i} className="flex justify-between tabular-nums">
                    <span>
                      {i + 1}. {entry.nickname}
                    </span>
                    <span className="text-neutral-400">{formatSeconds(entry.timeMs)}s</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-center mt-2">
          <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-blue-500 text-white">
            Retry
          </button>
          <Link href="/lessons" className="px-4 py-2 rounded-lg bg-neutral-700 text-white">
            Start typing practice
          </Link>
        </div>
      </div>
    </div>
  );
}
