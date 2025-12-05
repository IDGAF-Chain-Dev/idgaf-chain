# GitHub 저장소 준비하기

Render 배포를 위해 GitHub 저장소가 필요합니다.

## 옵션 1: 이미 GitHub에 저장소가 있다면

저장소 URL을 알려주세요:
- 예: `https://github.com/your-username/idgaf-chain`

## 옵션 2: 새로 만들기

### Step 1: GitHub에서 저장소 생성

1. https://github.com 접속
2. 우측 상단 "+" → "New repository" 클릭
3. 저장소 이름: `idgaf-chain` (또는 원하는 이름)
4. Public 또는 Private 선택
5. "Create repository" 클릭

### Step 2: 코드 푸시

Git이 설치되어 있다면:

```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/idgaf-chain.git
git push -u origin main
```

Git이 없다면:
- GitHub 웹사이트에서 직접 파일 업로드
- 또는 GitHub Desktop 사용

### Step 3: 저장소 URL 확인

생성된 저장소의 URL을 복사:
- 예: `https://github.com/your-username/idgaf-chain`

## 다음 단계

저장소 URL을 알려주시면 자동 배포를 진행하겠습니다!

