# 한글 타자 연습 (Korean Keyboard Trainer)

영문 키보드만으로 한글 두벌식 자판 위치를 익히는 웹 타자 연습기.
한글 IME 설치가 필요 없습니다 — 물리 키 입력을 직접 두벌식 자모로 조합합니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 단위 테스트
npm run build    # 프로덕션 빌드
```

## 기술 스택
Next.js (App Router) · TypeScript · Tailwind CSS · es-hangul · Vitest

## 배포
Vercel 에 연결된 GitHub 레포(`main`) push 시 자동 배포.
백엔드/DB 없음 (진행률은 브라우저 localStorage 에 저장).

설계 문서: `docs/superpowers/specs/`, 구현 계획: `docs/superpowers/plans/`
