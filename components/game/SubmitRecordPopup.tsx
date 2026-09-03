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

// 시안: 테두리 박스 안에 작은 라벨과 입력값이 한 줄로 들어간다
const FIELD_ROW =
  'flex items-center gap-[5px] rounded-[2px] border border-[#36454d] p-[10px] font-dmmono leading-[1.5]';
const FIELD_LABEL = 'shrink-0 text-[10px] tracking-[-0.19px] text-[#6b8999]';
const FIELD_INPUT =
  'min-w-0 flex-1 text-[12px] tracking-[-0.228px] text-[#36454d] outline-none placeholder:text-[#b8c5cc]';
// 시안 체크박스: 20x20 영역 안의 11.5px 사각형
const CHECKBOX =
  'size-[11.557px] shrink-0 appearance-none border-[1.111px] border-[#6b8999] checked:border-[#36454d] checked:bg-[#36454d]';

/** 기록 저장 폼 (시안 519:14583). */
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#36454d]/50 p-4 backdrop-blur-[5px]"
    >
      <div className="relative w-[320px] max-w-full overflow-hidden rounded-[2px] border border-[#36454d] bg-white">
        <div className="flex h-[40px] items-center justify-end bg-[#36454d]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid="submit-popup-close"
            className="flex size-[40px] items-center justify-center"
          >
            <img src="/race/icons/close.svg" alt="" aria-hidden className="size-[9.2px]" />
          </button>
        </div>

        {state.step === 'done' ? (
          <div className="flex flex-col items-center gap-[20px] px-[30px] pt-[27px] pb-[30px] text-center">
            <p className="font-dmsans text-[20px] font-extrabold leading-[1.3] text-[#36454d]">
              Record saved!
            </p>
            <p className="font-dmsans text-[14px] font-semibold leading-[1.2] text-[#9680ff]">
              Your best is {formatRaceTime(state.bestMs)} · Rank #{state.rank}
            </p>
            {leaderboard !== null && leaderboard.length > 0 && (
              <ol className="flex w-[260px] flex-col gap-[4px] font-dmsans text-[13px] text-[#36454d]">
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
            <button type="button" onClick={onClose} className={`${PIXEL_BUTTON} w-[200px]`}>
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="flex flex-col items-center gap-[20px] px-[30px] pt-[27px] pb-[30px]"
          >
            <div className="flex flex-col items-center gap-[25px]">
              <div className="flex flex-col gap-[10px] text-center">
                {/* 줄바꿈 위치는 시안 그대로 */}
                <h2 className="font-dmsans text-[20px] font-extrabold leading-[1.3] text-[#36454d]">
                  Save your Record
                  <br />
                  for a Chance to Win!
                </h2>
                <p className="font-dmsans text-[14px] font-semibold leading-[1.2] text-[#9680ff]">
                  The more you play,
                  <br />
                  the more chances to win!
                </p>
              </div>

              <div className="flex w-[260px] max-w-full flex-col gap-[10px]">
                <label className={FIELD_ROW}>
                  <span className={FIELD_LABEL}>Name:</span>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className={FIELD_INPUT}
                  />
                </label>
                <label className={FIELD_ROW}>
                  <span className={FIELD_LABEL}>Email:</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={FIELD_INPUT}
                  />
                </label>
              </div>

              <div className="flex w-[250px] max-w-full flex-col gap-[10px]">
                <label className="flex items-start gap-[10px]">
                  <span className="flex size-[20px] shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      required
                      data-testid="consent-required"
                      checked={consentRequired}
                      onChange={(e) => setConsentRequired(e.target.checked)}
                      className={CHECKBOX}
                    />
                  </span>
                  <span className="font-dmsans text-[14px] leading-[1.4] text-[#6b8999]">
                    (Required) I agree to have my name and email collected for the Hangeul Day
                    drawing.
                  </span>
                </label>
                <label className="flex items-start gap-[10px]">
                  <span className="flex size-[20px] shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      data-testid="consent-marketing"
                      checked={consentMarketing}
                      onChange={(e) => setConsentMarketing(e.target.checked)}
                      className={CHECKBOX}
                    />
                  </span>
                  <span className="font-dmsans text-[14px] leading-[1.4] text-[#6b8999]">
                    (Optional) I&apos;d love to receive Korean learning tips and exclusive
                    discounts from TTMIK!
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={state.step === 'submitting' || !consentRequired}
              className={`${PIXEL_BUTTON} w-[200px] disabled:opacity-50`}
            >
              {state.step === 'submitting' ? 'Saving…' : 'Submit Record'}
            </button>
            {state.step === 'error' && (
              <p className="font-dmsans text-[12px] text-[#ff5e23]">
                Failed to save. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
