# English Talk · 영어 회화 연습 앱

CEFR 레벨 적응형 AI 영어 회화 학습 앱. 10명의 캐릭터 + 8개 시나리오 + 음성 입출력 지원.

## 처음 사용하는 분께

1. 앱에 처음 접속하면 **Anthropic API 키 입력 화면**이 뜹니다.
2. [console.anthropic.com](https://console.anthropic.com/) 가입 → "API Keys" 메뉴 → "Create Key" 클릭 → 키 복사 (sk-ant-로 시작)
3. Anthropic 콘솔에서 결제 수단 등록 + 최소 $5 크레딧 충전 (사용량만큼만 차감)
4. 앱에 키 붙여넣기 → 저장
5. 브라우저에만 저장되며, 외부로 전송되지 않음 (Anthropic API 호출 외)

## 개발자용 — 로컬 실행

```bash
npm install
npm run dev
```

→ http://localhost:5173 자동 오픈

## 빌드

```bash
npm run build
```

→ `dist/` 폴더에 정적 파일 생성됨

## Vercel 배포

`DEPLOY.md` 참고.

## 주요 기능

- 적응형 CEFR 레벨 테스트 (A1~C2)
- 10명의 AI 캐릭터 (미국/영국/호주/인도 등 다양한 영어권)
- 8개 시나리오 (자유 대화, 카페, 공항, 호텔, 식당, 쇼핑, 면접, 병원)
- 3가지 교정 모드 (흐름 중심 / 균형 / 집중 학습)
- 음성 입출력 (Web Speech API) + 핸즈프리 모드
- 단어장 저장 (브라우저 localStorage)
- 대화 종료 시 한국어 리포트 자동 생성

## 모바일 호환성

- iOS Safari, Android Chrome 등 주요 모바일 브라우저 지원
- 음성 자동 재생을 위해 첫 화면 탭 후 사용 권장 (브라우저 보안 정책)

## 비용

Anthropic Claude Sonnet 4 모델 사용. 대략적인 사용량:
- 레벨 테스트 1회: 약 $0.05~0.15
- 메인 대화 1턴: 약 $0.02~0.05
- 종료 리포트: 약 $0.05~0.10

월 사용량에 따라 다르지만, 일반적인 학습용으로는 월 $5~20 수준.
