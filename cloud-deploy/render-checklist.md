# Render 배포 체크리스트

## ✅ 배포 전 확인사항

### 1. GitHub 저장소
- [ ] 프로젝트가 GitHub에 푸시되어 있음
- [ ] 저장소가 Public이거나 Render에 연결됨

### 2. 파일 확인
- [ ] `cloud-deploy/Dockerfile.render` 파일 존재
- [ ] `chain-config/genesis-mainnet.json` 파일 존재
- [ ] `.gitignore`에 불필요한 파일 제외됨

### 3. Render 설정
- [ ] Render 계정 생성 완료
- [ ] GitHub 저장소 연결됨

## 🚀 배포 단계

### Step 1: Render 대시보드
- [ ] "New +" → "Web Service" 클릭
- [ ] GitHub 저장소 선택 또는 URL 입력

### Step 2: 서비스 설정
- [ ] Name: `idgaf-chain-node`
- [ ] Region 선택
- [ ] Branch: `main` (또는 기본 브랜치)

### Step 3: 빌드 설정
- [ ] Environment: `Docker`
- [ ] Dockerfile Path: `cloud-deploy/Dockerfile.render`
- [ ] Docker Context: `.` (또는 비워두기)

### Step 4: 환경 변수
- [ ] `NETWORK_ID` = `10144`
- [ ] `CHAIN_ID` = `10144`

### Step 5: 배포
- [ ] "Create Web Service" 클릭
- [ ] 빌드 로그 확인
- [ ] 배포 완료 대기 (5-10분)

### Step 6: 확인
- [ ] RPC URL 확인
- [ ] Chain ID 테스트 성공
- [ ] 서비스 상태 "Live" 확인

## 📋 배포 후 작업

- [ ] RPC URL을 `.env`에 저장
- [ ] `hardhat.config.ts` 업데이트
- [ ] 프론트엔드 RPC URL 업데이트
- [ ] 컨트랙트 배포 테스트

## 🎯 빠른 참조

### Render 대시보드
- URL: https://dashboard.render.com
- 로그 확인: 서비스 → Logs 탭
- 설정 변경: 서비스 → Settings 탭

### 테스트 명령어
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  YOUR_RENDER_URL
```

### 예상 응답
```json
{"jsonrpc":"2.0","id":1,"result":"0x2790"}
```

