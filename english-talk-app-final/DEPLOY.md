# Vercel 배포 가이드

이 앱을 Vercel에 무료로 배포하는 방법. 두 가지 옵션이 있습니다.

---

## 옵션 A: Vercel CLI (가장 빠름, 5분)

### 1. Node.js 설치
이미 설치되어 있다면 건너뛰기. 없으면 [nodejs.org](https://nodejs.org/)에서 LTS 버전 다운로드.

### 2. 터미널/명령 프롬프트 열기
- Windows: `Win+R` → `cmd` 입력 → Enter
- Mac: Spotlight(`Cmd+Space`) → "터미널" 검색

### 3. 이 폴더로 이동 후 의존성 설치
```bash
cd 이폴더경로
npm install
```
(첫 실행 시 1~3분 소요)

### 4. 로컬 테스트 (선택)
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 자동 오픈. API 키 입력하고 동작 확인. Ctrl+C로 종료.

### 5. Vercel CLI 설치 + 배포
```bash
npm install -g vercel
vercel
```

처음 실행 시:
- 이메일 입력 → 메일로 온 링크 클릭하여 인증
- "Set up and deploy?" → `Y`
- "Which scope?" → 본인 계정 선택
- "Link to existing project?" → `N`
- "What's your project's name?" → 원하는 이름 (예: `english-talk`)
- "In which directory is your code located?" → `./` (Enter)
- 나머지 설정 → 모두 Enter (자동 감지)

→ 배포 완료. **Production URL**이 출력됨 (예: `https://english-talk-xxx.vercel.app`)

이 URL을 카톡으로 공유하면 됩니다.

### 6. 코드 수정 후 재배포
```bash
vercel --prod
```

---

## 옵션 B: GitHub + Vercel 웹 (자동 재배포 됨)

### 1. GitHub 계정 생성
[github.com](https://github.com) 가입 (무료)

### 2. 새 저장소 만들기
- 우측 상단 `+` → "New repository"
- Repository name: `english-talk-app`
- Public 또는 Private 선택
- "Create repository"

### 3. 이 폴더를 GitHub에 업로드
**방법 1 — GitHub Desktop (쉬움)**:
- [desktop.github.com](https://desktop.github.com) 다운로드 + 로그인
- "Add an Existing Repository from your Hard Drive" → 이 폴더 선택
- 우측 상단 "Publish repository" 클릭

**방법 2 — 명령어**:
```bash
cd 이폴더경로
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/사용자명/english-talk-app.git
git push -u origin main
```

### 4. Vercel에서 GitHub 연결
- [vercel.com](https://vercel.com) 가입 (GitHub 계정으로 로그인 가능)
- "Add New..." → "Project"
- GitHub 저장소 목록에서 `english-talk-app` 선택 → "Import"
- 설정 모두 기본값 유지 → "Deploy"
- 1~2분 후 배포 완료

→ Production URL 자동 생성

### 5. 자동 재배포
이후 GitHub에 코드를 push하면 Vercel이 자동으로 재배포합니다.

---

## 주의사항

### API 키 보안
- 이 앱은 **각 사용자가 자기 API 키를 입력**하는 방식입니다.
- 본인 API 키를 코드에 하드코딩하지 마세요. (다른 사람이 본인 비용으로 사용하게 됨)
- `.env` 파일에 키를 넣어도 빌드 시 노출되므로 동일 위험. 절대 금지.

### 도메인 변경
- 기본 URL: `https://프로젝트명-xxx.vercel.app`
- 커스텀 도메인 연결: Vercel 대시보드 → 프로젝트 → "Domains" → 도메인 추가

### 사용량 모니터링
- Vercel 무료 플랜: 100GB 대역폭/월 (충분함)
- Anthropic 사용량: [console.anthropic.com](https://console.anthropic.com/) → "Usage" 메뉴에서 확인

---

## 받는 사람에게 보낼 안내 문구 (카톡 템플릿)

```
영어 회화 앱 만들었어! 한번 써봐 👇
[Vercel URL]

처음 들어가면 Anthropic API 키 입력하라고 뜰 거야.
1) console.anthropic.com 가입
2) 카드 등록 + $5 충전
3) API Keys 메뉴에서 키 만들고 복사
4) 앱에 붙여넣기

본인 사용량만큼 본인 카드로 결제됨 (월 5~20달러 정도).
키는 본인 폰/PC에만 저장되고 외부로 안 나감.
```
