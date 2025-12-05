# 배포 가이드

IDGAF Chain 브리지 시스템을 배포하는 단계별 가이드입니다.

## 사전 요구사항

1. Node.js 및 npm 설치
2. Hardhat 설치 (`npm install`)
3. Monad 및 IDGAF Chain 네트워크 접근 권한
4. 배포용 계정의 개인키 (충분한 가스비 확보)

## 배포 순서

### 1단계: 환경 설정

`.env` 파일을 생성하고 필요한 변수를 설정하세요:

```env
MONAD_RPC_URL=https://rpc.monad.xyz
MONAD_CHAIN_ID=10143
IDGAF_RPC_URL=https://rpc.idgaf.chain
IDGAF_CHAIN_ID=10144
PRIVATE_KEY=your_private_key_here
```

### 2단계: 컨트랙트 컴파일

```bash
npm run compile
```

### 3단계: L2 컨트랙트 배포 (IDGAF Chain)

```bash
npx hardhat run scripts/deploy.ts --network idgaf
```

이 단계에서 배포되는 컨트랙트:
- `IDGAFTokenL2`: L2에서 사용할 래핑된 토큰
- `IDGAFChainBridge`: L2 브리지 컨트랙트

배포 후 주소를 기록해두세요.

### 4단계: L1 컨트랙트 배포 (Monad)

```bash
npx hardhat run scripts/deploy.ts --network monad
```

이 단계에서 배포되는 컨트랙트:
- `IDGAFBridge`: L1 브리지 컨트랙트

### 5단계: 브리지 연결 설정

L1과 L2 브리지를 연결합니다:

```bash
# L2 브리지에 L1 브리지 주소 설정
npx hardhat run scripts/setup-bridge.ts --network idgaf
```

### 6단계: 브리지 오퍼레이터 설정

L1 브리지에 신뢰할 수 있는 오퍼레이터를 추가합니다:

```typescript
// scripts/set-operator.ts 예시
const bridge = await ethers.getContractAt("IDGAFBridge", l1BridgeAddress);
await bridge.setBridgeOperator(operatorAddress, true);
```

### 7단계: 배포 검증

```bash
npx hardhat run scripts/verify-contracts.ts --network idgaf
npx hardhat run scripts/verify-contracts.ts --network monad
```

## 배포 후 확인사항

1. ✅ 모든 컨트랙트가 올바른 주소에 배포되었는지 확인
2. ✅ L2 토큰의 브리지 주소가 올바르게 설정되었는지 확인
3. ✅ L2 브리지의 Monad 브리지 주소가 올바르게 설정되었는지 확인
4. ✅ L1 브리지의 IDGAF 토큰 주소가 `0x87deEb3696Ec069d5460C389cc78925df50d7777`인지 확인
5. ✅ 브리지 오퍼레이터가 올바르게 설정되었는지 확인

## 릴레이어 설정

프로덕션 환경에서는 릴레이어를 설정하여 L1과 L2 간 이벤트를 모니터링하고 자동으로 처리해야 합니다.

릴레이어 예시 코드는 `scripts/relayer-example.ts`를 참고하세요.

## 문제 해결

### 배포 실패

- 가스비가 충분한지 확인
- 네트워크 연결 상태 확인
- 컨트랙트 컴파일 오류 확인

### 브리지 연결 실패

- 배포 주소가 올바른지 확인
- 네트워크가 올바른지 확인
- 트랜잭션이 성공했는지 확인

## 보안 체크리스트

- [ ] 모든 컨트랙트가 최신 버전으로 컴파일되었는지 확인
- [ ] 오너 주소가 멀티시그 지갑인지 확인
- [ ] 브리지 오퍼레이터가 신뢰할 수 있는 주소인지 확인
- [ ] 배포 전 모든 컨트랙트를 감사받았는지 확인
- [ ] 테스트넷에서 충분히 테스트했는지 확인

