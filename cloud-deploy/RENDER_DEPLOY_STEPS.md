# Render 배포 - 단계별 가이드

## ✅ 준비 완료
- **Render 계정**: 생성 완료 ✅
- **GitHub 저장소**: https://github.com/IDGAF-Chain-Dev/idgaf-chain ✅
- **API Key**: 준비됨 ✅

## 🚀 배포 단계 (5분 소요)

### 1단계: Render 대시보드 접속
1. https://dashboard.render.com 접속
2. 로그인 (이미 되어 있을 수 있음)

### 2단계: 새 서비스 생성
1. 화면 상단 또는 좌측의 **"New +"** 버튼 클릭
2. **"Web Service"** 선택

### 3단계: 저장소 연결
1. **"Connect a repository"** 클릭
2. GitHub 저장소 목록에서 **"IDGAF-Chain-Dev/idgaf-chain"** 찾아서 선택
   - 보이지 않으면 "Configure account" 클릭하여 GitHub 연결
   - 또는 "Public Git repository"에 직접 입력:
     ```
     https://github.com/IDGAF-Chain-Dev/idgaf-chain
     ```

### 4단계: 서비스 설정

#### 기본 정보
- **Name**: `idgaf-chain-node`
- **Region**: `Oregon (US West)` (또는 가장 가까운 지역)
- **Branch**: `main`
- **Root Directory**: (비워두기)

#### 빌드 설정
- **Environment**: `Docker` 선택
- **Dockerfile Path**: `cloud-deploy/Dockerfile.render`
- **Docker Context**: `.` (또는 비워두기)

#### 환경 변수 추가
1. "Advanced" 섹션 클릭
2. "Environment Variables" 섹션으로 스크롤
3. "Add Environment Variable" 클릭하여 다음 추가:

   **첫 번째 변수:**
   - Key: `NETWORK_ID`
   - Value: `10144`

   **두 번째 변수:**
   - Key: `CHAIN_ID`
   - Value: `10144`

### 5단계: 배포 시작
1. **"Create Web Service"** 버튼 클릭
2. 빌드 시작 (5-10분 소요)
3. "Logs" 탭에서 진행 상황 확인

### 6단계: RPC URL 확인
배포 완료 후:
- 서비스 대시보드 상단에 URL 표시됨
- 예: `https://idgaf-chain-node-xxxx.onrender.com`
- **이것이 당신의 RPC 엔드포인트입니다!**

## 📸 스크린샷 가이드

### 저장소 연결 화면
```
[Connect a repository]
  └─ GitHub 저장소 목록
     └─ IDGAF-Chain-Dev/idgaf-chain ← 선택
```

### 서비스 설정 화면
```
Name: idgaf-chain-node
Region: Oregon (US West)
Branch: main
Environment: Docker
Dockerfile Path: cloud-deploy/Dockerfile.render
```

### 환경 변수 화면
```
Environment Variables:
  NETWORK_ID = 10144
  CHAIN_ID = 10144
```

## ✅ 배포 확인

배포 완료 후 테스트:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://your-service.onrender.com
```

성공 응답:
```json
{"jsonrpc":"2.0","id":1,"result":"0x2790"}
```

## 🆘 문제 해결

### 저장소가 보이지 않음
- "Configure account" 클릭하여 GitHub 재연결
- 또는 "Public Git repository"에 URL 직접 입력

### 빌드 실패
- "Logs" 탭에서 에러 확인
- Dockerfile 경로 확인: `cloud-deploy/Dockerfile.render`
- GitHub 저장소에 파일이 푸시되어 있는지 확인

### 서비스 시작 안됨
- 환경 변수 확인
- 포트 설정 확인
- Logs 탭에서 에러 메시지 확인

## 📞 다음 단계

배포가 완료되면:
1. RPC URL을 알려주세요
2. `.env` 파일 업데이트
3. 컨트랙트 배포 테스트
4. 프론트엔드 RPC URL 업데이트

---

**배포 중 문제가 있으면 언제든지 알려주세요!**

