import { describe, it, expect, beforeEach } from 'vitest';
import { loadMuted, saveMuted, MUTE_KEY } from './mutePreference';

describe('mutePreference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 소리 켜짐(false)이 기본이다', () => {
    expect(loadMuted()).toBe(false);
  });

  it('음소거 설정을 저장하고 읽는다', () => {
    saveMuted(true);
    expect(loadMuted()).toBe(true);

    saveMuted(false);
    expect(loadMuted()).toBe(false);
  });

  it('손상된 값은 소리 켜짐으로 처리한다', () => {
    localStorage.setItem(MUTE_KEY, 'garbage');
    expect(loadMuted()).toBe(false);
  });
});
