# GitHub에 Dockerfile 푸시하기

## 방법 1: Git 명령어 사용 (Git 설치된 경우)

### Step 1: Git 상태 확인
```bash
git status
```

### Step 2: Dockerfile 추가 및 커밋
```bash
git add Dockerfile
git commit -m "Add Dockerfile for Render deployment"
```

### Step 3: GitHub에 푸시
```bash
git push origin main
```

---

## 방법 2: GitHub 웹사이트에서 직접 업로드 (가장 간단!)

### Step 1: GitHub 저장소 접속
1. https://github.com/IDGAF-Chain-Dev/idgaf-chain 접속
2. 로그인

### Step 2: 파일 업로드
1. **"Add file"** 버튼 클릭 (우측 상단)
2. **"Upload files"** 선택
3. **파일 드래그 앤 드롭** 또는 **"choose your files"** 클릭
4. 로컬의 `Dockerfile` 파일 선택
   - 경로: `C:\idgaf_chain\Dockerfile`
5. 하단에 커밋 메시지 입력:
   ```
   Add Dockerfile for Render deployment
   ```
6. **"Commit changes"** 버튼 클릭

### 완료! ✅
이제 GitHub에 Dockerfile이 업로드되었습니다!

---

## 방법 3: GitHub Desktop 사용

1. GitHub Desktop 설치: https://desktop.github.com
2. 저장소 열기: `IDGAF-Chain-Dev/idgaf-chain`
3. 변경사항 확인: `Dockerfile` 파일이 보임
4. 커밋 메시지 입력: "Add Dockerfile for Render deployment"
5. "Commit to main" 클릭
6. "Push origin" 클릭

---

## 확인 방법

업로드 후:
1. https://github.com/IDGAF-Chain-Dev/idgaf-chain 접속
2. 루트 디렉토리에 `Dockerfile` 파일이 보이는지 확인
3. 파일 클릭하여 내용 확인

---

## 다음 단계

Dockerfile이 GitHub에 업로드되면:
1. Render 대시보드로 돌아가기
2. **Manual Deploy** → **Deploy latest commit** 클릭
3. 배포 시작!

