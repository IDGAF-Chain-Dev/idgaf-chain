# 자동 배포 가이드 (Automated Deployment)

## 🚀 방법 1: 자동화 스크립트 사용 (권장)

### Step 1: Render API 키 생성

1. Render 대시보드 접속: https://dashboard.render.com
2. 우측 상단 프로필 클릭 → "Account Settings"
3. 좌측 메뉴에서 "API Keys" 클릭
4. "New API Key" 클릭
5. 이름 입력 (예: "IDGAF Chain Deployment")
6. API 키 복사 (한 번만 보여줌!)

### Step 2: GitHub 저장소 준비

프로젝트가 GitHub에 있어야 합니다:
```bash
# GitHub에 없다면
git init
git add .
git commit -m "Initial commit"
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/idgaf-chain.git
git push -u origin main
```

### Step 3: 자동 배포 실행

**Windows (PowerShell):**
```powershell
cd cloud-deploy
.\deploy-render-simple.ps1
```

**또는 Node.js 직접 실행:**
```bash
# API 키 설정
$env:RENDER_API_KEY="your-api-key-here"  # PowerShell
# 또는
export RENDER_API_KEY="your-api-key-here"  # Bash

# 스크립트 실행
node cloud-deploy/deploy-render-auto.js
```

스크립트가 자동으로:
- ✅ Render 계정 확인
- ✅ 서비스 생성
- ✅ 환경 변수 설정
- ✅ 배포 시작

### Step 4: 배포 확인

스크립트가 제공하는 URL로 접속하거나:
- Render 대시보드 → 서비스 → Logs 탭
- 배포 진행 상황 확인

---

## 📝 방법 2: 수동 배포 (더 안전)

API 키를 사용하고 싶지 않다면 수동으로 진행:

### 빠른 체크리스트

1. ✅ Render 계정 생성됨
2. ✅ GitHub 저장소 준비됨
3. ⬜ Render 대시보드 접속
4. ⬜ "New +" → "Web Service"
5. ⬜ 저장소 연결
6. ⬜ 설정 입력
7. ⬜ 배포 시작

### 상세 가이드

자세한 단계는 다음 파일 참고:
- `RENDER_DEPLOY_NOW.md` - 단계별 상세 가이드
- `render-checklist.md` - 체크리스트

---

## 🔐 보안 참고사항

### ✅ 안전한 방법
- Render API 키 사용 (제한된 권한)
- 환경 변수로 API 키 저장
- GitHub Actions 사용

### ❌ 피해야 할 방법
- 비밀번호 공유
- API 키를 코드에 하드코딩
- 공개 저장소에 API 키 커밋

---

## 🆘 문제 해결

### API 키 오류
```
Error: API Error: 401
```
→ API 키가 유효하지 않음. 새로 생성하세요.

### 저장소 연결 실패
```
Error: Repository not found
```
→ GitHub 저장소가 Public이거나 Render에 연결되어 있어야 합니다.

### 빌드 실패
→ Render 대시보드의 Logs 탭에서 에러 확인
→ `cloud-deploy/Dockerfile.render` 경로 확인

---

## 📞 다음 단계

배포 완료 후:
1. RPC URL 확인
2. `.env` 파일 업데이트
3. 컨트랙트 배포 테스트

