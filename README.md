# IDGAF Chain

Monad 체인 위에 구축된 Layer 2 블록체인입니다. IDGAF 토큰을 Monad(L1)와 IDGAF Chain(L2) 간에 브리징할 수 있습니다.

## 개요

IDGAF Chain은 Monad 메인넷을 기반으로 하는 Layer 2 솔루션으로, 다음과 같은 기능을 제공합니다:

- **양방향 브리지**: Monad ↔ IDGAF Chain 간 토큰 전송
- **IDGAF 토큰 지원**: L1 토큰 주소 `0x87deEb3696Ec069d5460C389cc78925df50d7777`
- **안전한 토큰 래핑**: L1 토큰을 L2에서 사용 가능한 형태로 변환

## 아키텍처

```
Monad (L1)                    IDGAF Chain (L2)
┌─────────────┐              ┌─────────────────┐
│ IDGAF Token │              │ IDGAFTokenL2     │
│ 0x87de...   │              │ (Wrapped Token)  │
└──────┬──────┘              └────────┬─────────┘
       │                              │
       │                              │
┌──────▼──────────┐          ┌────────▼────────────┐
│ IDGAFBridge     │◄────────►│ IDGAFChainBridge    │
│ (L1 Bridge)     │          │ (L2 Bridge)          │
└─────────────────┘          └─────────────────────┘
```

### 주요 컨트랙트

1. **IDGAFBridge** (L1): Monad 체인에 배포되는 브리지 컨트랙트
   - L1 토큰을 받아 L2로 전송 준비
   - L2에서의 출금 요청 처리

2. **IDGAFChainBridge** (L2): IDGAF Chain에 배포되는 브리지 컨트랙트
   - L1에서의 입금 처리 및 L2 토큰 민팅
   - L2에서의 출금 요청 처리 및 토큰 소각

3. **IDGAFTokenL2** (L2): L2에서 사용되는 래핑된 IDGAF 토큰
   - L1 토큰과 1:1 비율로 교환 가능
   - 브리지에 의해서만 민팅/소각 가능

## 설치

```bash
# 의존성 설치
npm install

# 또는
yarn install
```

## 환경 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Monad 네트워크 설정
MONAD_RPC_URL=https://rpc.monad.xyz
MONAD_CHAIN_ID=10143

# IDGAF Chain 네트워크 설정
IDGAF_RPC_URL=https://rpc.idgaf.chain
IDGAF_CHAIN_ID=10144

# 배포용 개인키 (절대 공개하지 마세요!)
PRIVATE_KEY=your_private_key_here
```

## 컴파일

```bash
npm run compile
```

## 테스트

```bash
npm test
```

## 배포

### 로컬 네트워크에 배포

```bash
# Hardhat 로컬 노드 시작 (별도 터미널)
npx hardhat node

# 배포 실행
npm run deploy
```

### Monad 및 IDGAF Chain에 배포

```bash
# Monad에 L1 브리지 배포
npx hardhat run scripts/deploy.ts --network monad

# IDGAF Chain에 L2 컨트랙트 배포
npx hardhat run scripts/deploy.ts --network idgaf

# 브리지 연결 설정
npx hardhat run scripts/setup-bridge.ts --network idgaf
```

## 사용 방법

### L1 → L2 (입금)

1. Monad에서 IDGAF 토큰을 L1 브리지에 입금:
```solidity
// IDGAFBridge 컨트랙트의 deposit 함수 호출
bridge.deposit(amount);
```

2. 릴레이어/오퍼레이터가 L2 브리지에서 입금 처리:
```solidity
// IDGAFChainBridge 컨트랙트의 processDeposit 함수 호출
l2Bridge.processDeposit(user, amount, depositId);
```

### L2 → L1 (출금)

1. L2에서 출금 요청:
```solidity
// IDGAFChainBridge 컨트랙트의 initiateWithdrawal 함수 호출
l2Bridge.initiateWithdrawal(amount);
```

2. 릴레이어/오퍼레이터가 L1 브리지에서 출금 처리:
```solidity
// IDGAFBridge 컨트랙트의 withdraw 함수 호출
l1Bridge.withdraw(user, amount, withdrawalId);
```

## 보안 고려사항

- 브리지 오퍼레이터는 신뢰할 수 있는 주소로만 설정하세요
- 모든 트랜잭션은 재진입 공격 방지를 위해 `nonReentrant` 모디파이어를 사용합니다
- 배포 전 모든 컨트랙트를 감사받으세요

## 네트워크 정보

### IDGAF Chain
- **Chain ID**: 10144
- **네이티브 토큰**: IDGAF
- **RPC URL**: `https://rpc.idgaf.chain`
- **Explorer**: `https://explorer.idgaf.chain`

### Monad
- **Chain ID**: 10143
- **IDGAF Token**: `0x87deEb3696Ec069d5460C389cc78925df50d7777`

## 라이선스

MIT

## 기여

이슈와 풀 리퀘스트를 환영합니다!

