'use client';

/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { useState } from 'react';
import { PIXEL_BUTTON } from './pixelButton';

interface Props {
  /** 공유할 결과 주소 */
  url: string;
  onClose: () => void;
}

/**
 * 결과 링크 공유 팝업.
 *
 * OS 공유 시트를 한 번 더 띄우지 않고 앱 안에서 처리하는 이유:
 * iOS 는 navigator.share 가 클릭 직후에 불려야 해서, 이미지 시트가 닫힌 뒤에
 * 다시 부르면 제스처가 만료돼 조용히 실패한다. 자체 팝업은 그 제약이 없어
 * PC·모바일에서 똑같이 동작한다.
 *
 * 생김새는 기록 저장 폼(시안 519:14583)을 따른다.
 */
export function ShareLinkPopup({ url, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // 권한이 없거나 보안 컨텍스트가 아니면 복사가 막힌다.
      // 주소는 읽기 전용 입력에 그대로 있으니 직접 선택해서 복사할 수 있다.
    }
  }

  return (
    <div
      data-testid="share-popup"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#36454d]/50 p-4 backdrop-blur-[5px]"
    >
      <div className="relative w-[320px] max-w-full overflow-hidden rounded-[2px] border border-[#36454d] bg-white">
        <div className="flex h-[40px] items-center justify-end bg-[#36454d]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid="share-popup-close"
            className="flex size-[40px] items-center justify-center"
          >
            <img src="/race/icons/close.svg" alt="" aria-hidden className="size-[9.2px]" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-[20px] px-[30px] pt-[27px] pb-[30px]">
          <div className="flex flex-col items-center gap-[25px]">
            <div className="flex flex-col gap-[10px] text-center">
              <h2 className="font-dmsans text-[20px] font-extrabold leading-[1.3] text-[#36454d]">
                Share your Record!
              </h2>
              <p className="font-dmsans text-[14px] font-semibold leading-[1.2] text-[#9680ff]">
                Anyone with this link
                <br />
                can see your result card.
              </p>
            </div>

            {/* 주소가 한 줄에 안 들어가서 두 줄로 흘린다 — 입력으로 두면 절반이 잘린다.
                select-all 이라 한 번 누르면 통째로 잡혀, 복사가 막히는 환경에서도 직접 가져갈 수 있다. */}
            <p
              data-testid="share-link"
              className="w-[260px] max-w-full [word-break:break-all] select-all rounded-[2px] border border-[#36454d] p-[10px] text-center font-dmmono text-[12px] leading-[1.5] tracking-[-0.228px] text-[#36454d]"
            >
              {url}
            </p>
          </div>

          <button
            type="button"
            onClick={copy}
            data-testid="share-copy"
            className={`${PIXEL_BUTTON} w-[200px]`}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
