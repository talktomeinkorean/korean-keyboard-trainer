/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */

interface Props {
  on: boolean;
  onToggle: () => void;
}

/** 다음에 눌러야 할 키를 키보드에 강조할지 여부를 켜고 끄는 토글. */
export function KeyGuideToggle({ on, onToggle }: Props) {
  return (
    <div className="flex items-center gap-[15px]">
      <span className="flex items-center gap-[5px]">
        <img
          src="/race/icons/key.png"
          alt=""
          aria-hidden
          className="size-[19px] rotate-30"
          style={{ imageRendering: 'pixelated' }}
        />
        <span className="text-[12px] font-bold text-[#36454d]">Key Guide</span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Key Guide"
        data-testid="key-guide-toggle"
        onClick={onToggle}
        className={`relative h-[18px] w-[42px] rounded-full border-[0.75px] border-[#36454d] transition-colors ${
          on ? 'bg-[#8ceb97]' : 'bg-[#d9d9d9]'
        }`}
      >
        <span
          className={`absolute top-1/2 size-[18px] -translate-y-1/2 rounded-full border-[0.75px] border-[#36454d] bg-white transition-[left] ${
            on ? 'left-[24px]' : 'left-0'
          }`}
        />
        <span
          className={`absolute top-1/2 -translate-y-1/2 text-[8px] font-bold text-[#36454d]/40 ${
            on ? 'left-[6px]' : 'right-[5px]'
          }`}
        >
          {on ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
}
