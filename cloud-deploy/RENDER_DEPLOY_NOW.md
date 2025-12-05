# Render 배포 - 지금 바로 시작!

## ✅ 현재 상태
- Render 계정 생성 완료 (GitHub로 가입)
- 다음 단계로 진행!

## 🚀 배포 단계

### Step 1: Render 대시보드에서 서비스 생성

1. **Render 대시보드 접속**
   - https://dashboard.render.com
   - 로그인되어 있음 ✅

2. **"New +" 버튼 클릭**
   - 화면 상단 우측 또는 좌측 메뉴

3. **"Web Service" 선택**

### Step 2: 저장소 연결

**옵션 A: GitHub 저장소가 이미 있다면**
- "Connect a repository" 클릭
- GitHub 저장소 선택
- 권한 허용

**옵션 B: 아직 GitHub에 없다면**
```bash
# 현재 디렉토리에서
git init
git add .
git commit -m "Initial commit for Render deployment"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/idgaf-chain.git
git branch -M main
git push -u origin main
```

그 다음 Render에서 저장소 연결

### Step 3: 서비스 설정

#### 기본 정보
- **Name**: `idgaf-chain-node` (원하는 이름)
- **Region**: `Oregon (US West)` 또는 가장 가까운 지역
- **Branch**: `main`

#### 빌드 설정
**방법 1: Docker 사용 (권장)**

- **Environment**: `Docker` 선택
- **Dockerfile Path**: `cloud-deploy/Dockerfile.render`
- **Docker Context**: `.` (루트)

**방법 2: 수동 명령어**

- **Build Command**:
  ```bash
  docker build -f cloud-deploy/Dockerfile.render -t idgaf-node .
  ```

- **Start Command**:
  ```bash
  geth --networkid 10144 --datadir /data --http --http.addr 0.0.0.0 --http.port $PORT --http.api eth,net,web3,txpool --http.corsdomain '*' --http.vhosts '*' --ws --ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,net,web3 --ws.origins '*' --allow-insecure-unlock --rpc.allow-unprotected-txs --nodiscover
  ```

#### 환경 변수 (Environment Variables)
"Advanced" 섹션에서 추가:

| Key | Value |
|-----|-------|
| `NETWORK_ID` | `10144` |
| `CHAIN_ID` | `10144` |

#### 포트
- Render가 자동으로 `$PORT` 환경 변수 제공
- Start Command에서 `$PORT` 사용 (또는 8545 고정)

### Step 4: 배포 시작

1. **"Create Web Service" 클릭**
2. 빌드 시작 (5-10분 소요)
3. "Logs" 탭에서 진행 상황 확인

### Step 5: RPC URL 확인

배포 완료 후:
- 서비스 대시보드 상단에 URL 표시
- 예: `https://idgaf-chain-node-xxxx.onrender.com`
- **이것이 당신의 RPC 엔드포인트입니다!**

### Step 6: 테스트

배포 완료 후 테스트:

```bash
# Chain ID 확인
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://your-service.onrender.com
```

성공 응답:
```json
{"jsonrpc":"2.0","id":1,"result":"0x2790"}
```

## 📝 체크리스트

배포 전 확인:
- [ ] GitHub 저장소에 코드 푸시됨
- [ ] Render에서 저장소 연결됨
- [ ] Dockerfile 경로: `cloud-deploy/Dockerfile.render`
- [ ] 환경 변수 설정됨
- [ ] 포트 설정 확인

## ⚠️ 주의사항

### 무료 티어 제한
- 15분 비활성 후 슬립 (sleep)
- 첫 요청 시 30-60초 대기 (wake up)
- 750시간/월 무료

### 해결 방법
- Health check 설정 (자동 wake up)
- 또는 Starter Plan ($7/월)으로 업그레이드

## 🎉 완료 후

1. **RPC URL 저장**
   ```
   https://your-service.onrender.com
   ```

2. **프로젝트 설정 업데이트**
   ```bash
   # .env 파일
   IDGAF_RPC_URL=https://your-service.onrender.com
   ```

3. **컨트랙트 배포**
   ```bash
   npm run deploy:l2
   ```

## 🆘 문제 해결

### 빌드 실패
- 로그 확인: Render 대시보드 → Logs
- Dockerfile 경로 확인
- `chain-config/genesis-mainnet.json` 파일 존재 확인

### 서비스 시작 안됨
- 포트 번호 확인
- 환경 변수 확인
- Start Command 확인

### RPC 응답 없음
- 서비스가 슬립 상태일 수 있음
- 첫 요청 시 30-60초 기다리기
- Health check 설정 확인

## 📞 도움이 필요하면

Render 대시보드의 "Logs" 탭에서 모든 로그를 실시간으로 확인할 수 있습니다!

