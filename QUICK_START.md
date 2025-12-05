# IDGAF Chain 빠른 시작 가이드

## 🚀 전체 시스템 실행하기

### 1. 프론트엔드 실행 (Simple Version - 권장)

가장 간단한 방법:

1. `frontend/index-simple.html` 파일을 브라우저에서 열기
2. MetaMask 지갑 연결
3. 브리지 사용 시작!

### 2. 릴레이어 서비스 실행

```bash
# 릴레이어 시작 (L1/L2 이벤트 모니터링 및 자동 처리)
npm run relayer
```

**별도 터미널에서 L2 노드 실행 (로컬 테스트용):**
```bash
npm run node:idgaf
```

### 3. L1 브리지 오퍼레이터 설정

릴레이어 계정을 L1 브리지의 오퍼레이터로 설정:

```bash
npx hardhat run scripts/setup-operator.ts --network monad
```

## 📋 체크리스트

### 필수 설정
- [x] 스마트 컨트랙트 배포 완료
- [ ] 릴레이어 서비스 실행
- [ ] L1 브리지 오퍼레이터 설정
- [ ] 프론트엔드 접근

### 테스트
- [ ] L1 → L2 입금 테스트
- [ ] L2 → L1 출금 테스트
- [ ] 릴레이어 자동 처리 확인

## 🎯 사용 시나리오

### 시나리오 1: L1 → L2 입금

1. 프론트엔드에서 "Monad → IDGAF" 선택
2. 금액 입력 (예: 100 IDGAF)
3. "브리지 실행" 클릭
4. MetaMask에서 트랜잭션 승인
5. 릴레이어가 자동으로 L2에서 처리
6. L2 지갑에서 토큰 확인

### 시나리오 2: L2 → L1 출금

1. 프론트엔드에서 "IDGAF → Monad" 선택
2. 금액 입력
3. "브리지 실행" 클릭
4. MetaMask에서 트랜잭션 승인
5. 릴레이어가 자동으로 L1에서 처리
6. Monad 지갑에서 토큰 확인

## 🔧 유용한 명령어

```bash
# 잔액 확인
npx hardhat run scripts/check-balance.ts --network monad

# 브리지 플로우 테스트
npx hardhat run scripts/test-bridge-flow.ts --network hardhat

# RPC 연결 테스트
npx hardhat run scripts/test-rpc.ts

# 컨트랙트 검증
npx hardhat run scripts/verify-contracts.ts --network monad
```

## 📍 배포된 컨트랙트 주소

### Monad (L1)
- **IDGAFBridge**: `0x006a5044781F97475390F33E3E1c903e393fcc3d`
- **IDGAF Token**: `0x87deEb3696Ec069d5460C389cc78925df50d7777`

### IDGAF Chain (L2)
- **IDGAFTokenL2**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **IDGAFChainBridge**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## 🆘 문제 해결

### 릴레이어가 작동하지 않음
- RPC URL 확인
- 네트워크 연결 확인
- 오퍼레이터 권한 확인

### 프론트엔드에서 트랜잭션 실패
- MetaMask 네트워크 확인
- 가스비 확인
- 토큰 잔액 확인

### 네트워크 연결 오류
- `.env` 파일 설정 확인
- RPC 엔드포인트 작동 여부 확인

## 📚 추가 문서

- [README.md](./README.md) - 프로젝트 개요
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - 배포 요약
- [NEXT_STEPS.md](./NEXT_STEPS.md) - 다음 단계
- [relayer/README.md](./relayer/README.md) - 릴레이어 가이드
- [frontend/README.md](./frontend/README.md) - 프론트엔드 가이드

