# Render 배포 단계별 가이드

## Step 1: GitHub 저장소 준비

### 옵션 A: 이미 GitHub에 있다면
- 저장소 URL을 준비하세요

### 옵션 B: GitHub에 없다면
```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/your-username/idgaf-chain.git
git push -u origin main
```

## Step 2: Render에서 Web Service 생성

1. **Render 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인

2. **새 서비스 생성**
   - "New +" 버튼 클릭
   - "Web Service" 선택

3. **저장소 연결**
   - "Connect account" 또는 "Connect repository" 클릭
   - GitHub 저장소 선택
   - 또는 "Public Git repository"에 URL 입력

## Step 3: 서비스 설정

### 기본 설정
- **Name**: `idgaf-chain-node`
- **Region**: 가장 가까운 지역 선택
- **Branch**: `main` (또는 기본 브랜치)
- **Root Directory**: `cloud-deploy` (또는 루트)

### 빌드 설정
- **Environment**: `Docker`
- **Dockerfile Path**: `cloud-deploy/Dockerfile.render`
- **Docker Context**: `.` (루트 디렉토리)

또는:

- **Build Command**: 
  ```bash
  cd cloud-deploy && docker build -f Dockerfile.render -t idgaf-node .
  ```

- **Start Command**:
  ```bash
  geth --networkid 10144 --datadir /data --http --http.addr 0.0.0.0 --http.port 8545 --http.api eth,net,web3,txpool --http.corsdomain '*' --http.vhosts '*' --ws --ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,net,web3 --ws.origins '*' --allow-insecure-unlock --rpc.allow-unprotected-txs --nodiscover
  ```

### 환경 변수 (Environment Variables)
```
NETWORK_ID=10144
CHAIN_ID=10144
HTTP_PORT=8545
WS_PORT=8546
```

### 포트 설정
- **Port**: `8545` (HTTP RPC)

## Step 4: 배포

1. **"Create Web Service" 클릭**
2. Render가 자동으로 빌드 및 배포 시작
3. 로그 확인 (빌드 진행 상황)

## Step 5: RPC URL 확인

배포 완료 후:
1. 서비스 대시보드로 이동
2. 상단에 표시된 URL 확인
   - 예: `https://idgaf-chain-node.onrender.com`
3. 이것이 당신의 RPC 엔드포인트입니다!

## Step 6: 테스트

```bash
# Chain ID 확인
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://your-service.onrender.com
```

예상 응답:
```json
{"jsonrpc":"2.0","id":1,"result":"0x2790"}
```

## Step 7: 커스텀 도메인 설정 (선택사항)

1. Render 대시보드 → Settings → Custom Domains
2. "Add Custom Domain" 클릭
3. 도메인 입력: `rpc.idgaf.chain`
4. DNS 레코드 업데이트 (Render가 안내)
5. SSL 자동 설정됨

## 무료 티어 주의사항

- ✅ 완전 무료
- ⚠️ 15분 비활성 후 슬립 (sleep)
- ⚠️ 첫 요청 시 30-60초 대기 (wake up)
- ✅ 750시간/월 무료

## 업그레이드 (선택사항)

더 나은 성능을 위해:
- **Starter Plan**: $7/월 (슬립 없음)
- **Standard Plan**: $25/월 (더 나은 성능)

## 문제 해결

### 빌드 실패
- Dockerfile 경로 확인
- 로그에서 에러 확인
- `cloud-deploy/Dockerfile.render` 파일 존재 확인

### 서비스가 시작되지 않음
- 포트 번호 확인 (8545)
- 환경 변수 확인
- 로그 확인

### RPC가 응답하지 않음
- 서비스가 슬립 상태일 수 있음 (첫 요청 시 깨어남)
- Health check 설정 확인

## 다음 단계

배포 완료 후:
1. RPC URL을 `.env`에 업데이트
2. 컨트랙트 배포: `npm run deploy:l2`
3. 프론트엔드에서 RPC URL 업데이트
4. 테스트!

