'use client';

/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { useEffect, useState } from 'react';
import { PIXEL_BUTTON } from './pixelButton';
import { formatRaceTime } from '@/lib/game/rank';

export interface LeaderboardEntry {
  nickname: string;
  timeMs: number;
}

interface Props {
  timeMs: number;
  accuracy: number;
  onClose: () => void;
}

type SubmitState =
  | { step: 'form' }
  | { step: 'submitting' }
  | { step: 'done'; bestMs: number; rank: number }
  | { step: 'error' };

const PLAYER_KEY = 'race-player';

function loadPlayer(): { email: string; nickname: string } {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* 무시 — 손상된 저장값은 빈 값으로 대체 */
  }
  return { email: '', nickname: '' };
}

const FIELD =
  'rounded-[2px] border border-[#36454d] px-[10px] py-[7px] font-dmsans text-[13px] text-[#36454d] placeholder:text-[#8ba1ab]';

/**
 * 기록 저장 폼. 시안에는 "Submit This Record" 버튼만 있고 폼 화면이 없어서
 * 게임의 다른 팝업(ExitPopup)과 같은 껍데기를 쓴다.
 */
export function SubmitRecordPopup({ timeMs, accuracy, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [state, setState] = useState<SubmitState>({ step: 'form' });
  // 동의는 매번 새로 받는다 (저장했다가 자동 체크하면 동의 기록의 의미가 없다)
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    const saved = loadPlayer();
    setEmail(saved.email);
    setNickname(saved.nickname);
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
    <div
      data-testid="submit-popup"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#36454d]/70 p-4 backdrop-blur-[10px]"
    >
      <div className="relative w-[290px] max-w-full overflow-hidden rounded-[2px] border border-[#36454d] bg-white">
        <div className="flex h-[40px] items-center justify-between bg-[#36454d] pl-[15px]">
          <span className="font-dmmono text-[13px] text-white">Submit This Record</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid="submit-popup-close"
            className="flex size-[40px] items-center justify-center"
          >
            <img src="/race/icons/close.svg" alt="" aria-hidden className="size-[9px]" />
          </button>
        </div>

        {state.step === 'done' ? (
          <div className="flex flex-col gap-[10px] px-[20px] py-[20px] text-[#36454d]">
            <p className="font-dmsans text-[14px] font-bold">
              Saved! Your best is {formatRaceTime(state.bestMs)} · Rank #{state.rank}
            </p>
            {leaderboard !== null && leaderboard.length > 0 && (
              <ol className="flex flex-col gap-[2px] font-dmsans text-[13px]">
                {leaderboard.map((entry, i) => (
                  <li key={i} className="flex justify-between tabular-nums">
                    <span>
                      {i + 1}. {entry.nickname}
                    </span>
                    <span className="text-[#6b8999]">{formatRaceTime(entry.timeMs)}</span>
                  </li>
                ))}
              </ol>
            )}
            <button type="button" onClick={onClose} className={`${PIXEL_BUTTON} mt-[5px] w-full`}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-[10px] px-[20px] py-[20px]">
            <input
              type="text"
              required
              maxLength={20}
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={FIELD}
            />
            <input
              type="email"
              required
              placeholder="Email (not shown publicly)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD}
            />
            <label className="flex items-start gap-[6px] font-dmsans text-[11px] leading-[1.4] text-[#36454d]">
              <input
                type="checkbox"
                required
                data-testid="consent-required"
                checked={consentRequired}
                onChange={(e) => setConsentRequired(e.target.checked)}
                className="mt-[2px] shrink-0"
              />
              <span>
                (Required) I agree to have my name and email collected for the Hangeul Day drawing.
              </span>
            </label>
            <label className="flex items-start gap-[6px] font-dmsans text-[11px] leading-[1.4] text-[#36454d]">
              <input
                type="checkbox"
                data-testid="consent-marketing"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-[2px] shrink-0"
              />
              <span>
                (Optional) I&apos;d love to receive Korean learning tips and exclusive discounts
                from TTMIK!
              </span>
            </label>
            <button
              type="submit"
              disabled={state.step === 'submitting' || !consentRequired}
              className={`${PIXEL_BUTTON} w-full disabled:opacity-50`}
            >
              {state.step === 'submitting' ? 'Saving…' : 'Save my score'}
            </button>
            {state.step === 'error' && (
              <p className="font-dmsans text-[11px] text-[#ff5e23]">
                Failed to save. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
