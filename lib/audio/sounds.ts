/**
 * 게임 사운드 재생기 (레이스 전용).
 *
 * HTMLAudioElement 를 쓰는 이유:
 * - BGM(68초)을 Web Audio 로 디코딩하면 PCM 이 메모리에 수십 MB 로 올라간다. 이쪽은 스트리밍된다.
 * - 효과음은 서로 겹칠 일이 없어(단어 완성/완주) 저지연 중첩 재생이 필요 없다.
 *
 * 브라우저 자동재생 정책상 사용자 입력 전에는 재생이 거부되므로,
 * 첫 키 입력 이후에 호출해야 한다. 거부되더라도 게임 진행에는 영향이 없게 무시한다.
 */

export type SfxName = 'wordComplete' | 'finish';

const SRC: Record<SfxName | 'bgm', string> = {
  bgm: '/sounds/bgm.mp3',
  wordComplete: '/sounds/word_complete.wav',
  finish: '/sounds/finish.wav',
};

const BGM_VOLUME = 0.3;
const SFX_VOLUME = 0.7;

let bgmEl: HTMLAudioElement | null = null;
const sfxEls = new Map<SfxName, HTMLAudioElement>();

function getSfx(name: SfxName): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null; // SSR 가드
  let el = sfxEls.get(name);
  if (!el) {
    el = new Audio(SRC[name]);
    el.volume = SFX_VOLUME;
    sfxEls.set(name, el);
  }
  return el;
}

export function playSfx(name: SfxName): void {
  const el = getSfx(name);
  if (!el) return;
  el.currentTime = 0;
  void el.play().catch(() => {
    /* 자동재생 차단 등 — 무시 */
  });
}

/** BGM 시작. Audio 객체를 이 시점에 만들어 게임을 시작하지 않은 방문자는 1MB 를 받지 않는다. */
export function startBgm(): void {
  if (typeof Audio === 'undefined') return;
  if (!bgmEl) {
    bgmEl = new Audio(SRC.bgm);
    bgmEl.loop = true;
    bgmEl.volume = BGM_VOLUME;
  }
  void bgmEl.play().catch(() => {
    /* 자동재생 차단 등 — 무시 */
  });
}

/** 재생 위치를 남긴 채 멈춘다. 다시 startBgm 하면 그 지점부터 이어진다. */
export function pauseBgm(): void {
  bgmEl?.pause();
}

export function stopBgm(): void {
  if (!bgmEl) return;
  bgmEl.pause();
  bgmEl.currentTime = 0;
}
