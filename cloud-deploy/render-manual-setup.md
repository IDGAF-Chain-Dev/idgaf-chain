# Render 수동 배포 가이드 (API 오류 시)

API 자동화에 문제가 있어서 수동 배포 방법을 안내합니다.

## ✅ 준비 완료된 정보

- **Render API Key**: `rnd_BgrRauOTQXq4qt2bOnXjnhUJ3Y23` ✅
- **GitHub Repository**: `https://github.com/IDGAF-Chain-Dev/idgaf-chain` ✅

## 🚀 Render 대시보드에서 배포하기

### Step 1: Render 대시보드 접속

1. https://dashboard.render.com 접속
2. 로그인 (이미 로그인되어 있을 수 있음)

### Step 2: 새 Web Service 생성

1. **"New +" 버튼 클릭** (화면 상단 우측)
2. **"Web Service" 선택**

### Step 3: 저장소 연결

1. **"Connect a repository" 클릭**
2. GitHub 저장소 목록에서 **"IDGAF-Chain-Dev/idgaf-chain"** 선택
   - 또는 "Public Git repository"에 직접 입력:
     ```
     https://github.com/IDGAF-Chain-Dev/idgaf-chain
     ```
3. **권한 허용** (처음이라면)

### Step 4: 서비스 설정

#### 기본 정보
- **Name**: `idgaf-chain-node`
- **Region**: `Oregon (US West)` 또는 가장 가까운 지역
- **Branch**: `main`
- **Root Directory**: (비워두기 - 루트 사용)

#### 빌드 설정
- **Environment**: `Docker` 선택
- **Dockerfile Path**: `cloud-deploy/Dockerfile.render`
- **Docker Context**: `.` (또는 비워두기)

#### 환경 변수 (Environment Variables)
"Advanced" 섹션 → "Environment Variables" 클릭

다음 변수들을 추가:

| Key | Value |
|-----|-------|
| `NETWORK_ID` | `10144` |
| `CHAIN_ID` | `10144` |

#### 포트
- Render가 자동으로 포트 할당
- 또는 `8545` 고정 (선택사항)

### Step 5: 배포 시작

1. **"Create Web Service" 클릭**
2. 빌드 시작 (5-10분 소요)
3. "Logs" 탭에서 진행 상황 확인

### Step 6: RPC URL 확인

배포 완료 후:
- 서비스 대시보드 상단에 URL 표시
- 예: `https://idgaf-chain-node-xxxx.onrender.com`
- **이것이 당신의 RPC 엔드포인트입니다!**

## 📋 체크리스트

배포 전 확인:
- [x] Render 계정 생성됨
- [x] GitHub 저장소 준비됨 (`IDGAF-Chain-Dev/idgaf-chain`)
- [ ] Render 대시보드 접속
- [ ] "New +" → "Web Service"
- [ ] 저장소 연결
- [ ] Dockerfile Path: `cloud-deploy/Dockerfile.render`
- [ ] 환경 변수 설정 (NETWORK_ID, CHAIN_ID)
- [ ] 배포 시작

## 🎯 빠른 참조

### Render 대시보드
- URL: https://dashboard.render.com
- 로그 확인: 서비스 → Logs 탭
- 설정 변경: 서비스 → Settings 탭

### 테스트 명령어 (배포 후)
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://your-service.onrender.com
```

예상 응답:
```json
{"jsonrpc":"2.0","id":1,"result":"0x2790"}
```

## ⚠️ 주의사항

### 무료 티어 제한
- 15분 비활성 후 슬립 (sleep)
- 첫 요청 시 30-60초 대기 (wake up)
- 750시간/월 무료

### 해결 방법
- Health check 설정 (자동 wake up)
- 또는 Starter Plan ($7/월)으로 업그레이드

## 🆘 문제 해결

### 빌드 실패
- 로그 확인: Render 대시보드 → Logs
- Dockerfile 경로 확인: `cloud-deploy/Dockerfile.render`
- `chain-config/genesis-mainnet.json` 파일 존재 확인

### 서비스 시작 안됨
- 포트 번호 확인
- 환경 변수 확인
- Start Command 확인

### RPC 응답 없음
- 서비스가 슬립 상태일 수 있음
- 첫 요청 시 30-60초 기다리기
- Health check 설정 확인

## 📞 다음 단계

배포 완료 후 알려주시면:
1. RPC URL을 `.env`에 업데이트
2. 컨트랙트 배포 테스트
3. 프론트엔드 RPC URL 업데이트

