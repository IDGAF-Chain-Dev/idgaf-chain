# Render 빠른 시작 가이드

## 🚀 5분 안에 배포하기

### 1단계: GitHub 저장소 확인

현재 프로젝트가 GitHub에 있는지 확인:
```bash
git remote -v
```

없다면:
```bash
git init
git add .
git commit -m "Initial commit"
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/idgaf-chain.git
git push -u origin main
```

### 2단계: Render에서 서비스 생성

1. **Render 대시보드 접속**
   - https://dashboard.render.com
   - 이미 로그인되어 있음 ✅

2. **"New +" 버튼 클릭**
   - 화면 상단 또는 좌측 메뉴

3. **"Web Service" 선택**

4. **저장소 연결**
   - "Connect a repository" 클릭
   - GitHub 저장소 선택
   - 또는 "Public Git repository"에 URL 입력:
     ```
     https://github.com/YOUR_USERNAME/idgaf-chain
     ```

### 3단계: 서비스 설정

#### 기본 정보
- **Name**: `idgaf-chain-node` (원하는 이름)
- **Region**: `Oregon (US West)` 또는 가장 가까운 지역
- **Branch**: `main` (또는 기본 브랜치)

#### 빌드 & 배포
- **Root Directory**: (비워두기 - 루트 사용)
- **Environment**: `Docker` 선택
- **Dockerfile Path**: `cloud-deploy/Dockerfile.render`
- **Docker Context**: `.` (또는 비워두기)

또는 수동으로:

**Build Command**:
```bash
docker build -f cloud-deploy/Dockerfile.render -t idgaf-node .
```

**Start Command**:
```bash
geth --networkid 10144 --datadir /data --http --http.addr 0.0.0.0 --http.port $PORT --http.api eth,net,web3,txpool --http.corsdomain '*' --http.vhosts '*' --ws --ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,net,web3 --ws.origins '*' --allow-insecure-unlock --rpc.allow-unprotected-txs --nodiscover
```

#### 환경 변수
"Advanced" 섹션에서 추가:
- `NETWORK_ID` = `10144`
- `CHAIN_ID` = `10144`

#### 포트
- Render가 자동으로 `$PORT` 환경 변수 제공
- Start Command에서 `$PORT` 사용

### 4단계: 배포 시작

1. **"Create Web Service" 클릭**
2. 빌드 시작 (5-10분 소요)
3. 로그에서 진행 상황 확인

### 5단계: RPC URL 확인

배포 완료 후:
- 서비스 대시보드 상단에 URL 표시
- 예: `https://idgaf-chain-node.onrender.com`
- 이것이 당신의 RPC 엔드포인트!

### 6단계: 테스트

브라우저나 터미널에서:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://your-service.onrender.com
```

성공하면:
```json
{"jsonrpc":"2.0","id":1,"result":"0x2790"}
```

## ✅ 완료!

이제 IDGAF Chain 노드가 Render에서 실행 중입니다!

## 다음 단계

1. **RPC URL 업데이트**
   ```bash
   # .env 파일 수정
   IDGAF_RPC_URL=https://your-service.onrender.com
   ```

2. **컨트랙트 배포**
   ```bash
   npm run deploy:l2
   ```

3. **프론트엔드 업데이트**
   - `frontend/app-simple.js`에서 RPC URL 업데이트

## 무료 티어 참고

- ⚠️ 15분 비활성 후 슬립
- ⚠️ 첫 요청 시 30-60초 대기
- ✅ 완전 무료
- ✅ 750시간/월

## 문제가 있나요?

1. **빌드 실패**: 로그 확인 → Dockerfile 경로 확인
2. **서비스 시작 안됨**: 포트 설정 확인
3. **RPC 응답 없음**: 서비스가 슬립 상태일 수 있음 (첫 요청 시 깨어남)

Render 대시보드의 "Logs" 탭에서 모든 로그를 확인할 수 있습니다!

