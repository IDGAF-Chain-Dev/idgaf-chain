# IDGAF Chain 배포 완료 요약

## 배포 일시
2025-12-05

## 네트워크별 배포 정보

### 1. Monad 네트워크 (L1) - Chain ID: 143

**배포자 주소:** `0x359A8BC2A440548086f1701229971CEfE52226e9`

**배포된 컨트랙트:**

#### IDGAFBridge (L1 브리지)
- **주소:** `0x006a5044781F97475390F33E3E1c903e393fcc3d`
- **기능:** Monad에서 IDGAF 토큰을 받아 L2로 전송 준비
- **RPC URL:** `https://rpc1.monad.xyz`
- **Explorer:** [MonadVision](https://monadvision.com)

**연결된 토큰:**
- IDGAF Token (L1): `0x87deEb3696Ec069d5460C389cc78925df50d7777`

---

### 2. IDGAF Chain (L2) - Chain ID: 10144

**배포자 주소:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (로컬 테스트 계정)

**배포된 컨트랙트:**

#### IDGAFTokenL2 (L2 토큰)
- **주소:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **기능:** L2에서 사용되는 래핑된 IDGAF 토큰
- **심볼:** IDGAF
- **이름:** IDGAF Token

#### IDGAFChainBridge (L2 브리지)
- **주소:** `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **기능:** L1과 L2 간 토큰 브리징 처리
- **연결된 L1 브리지:** `0x006a5044781F97475390F33E3E1c903e393fcc3d`

**RPC URL:** `http://localhost:8546` (로컬 개발 환경)

---

## 브리지 연결 상태

✅ **L1 ↔ L2 브리지 연결 완료**

- L1 브리지: `0x006a5044781F97475390F33E3E1c903e393fcc3d` (Monad)
- L2 브리지: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` (IDGAF Chain)
- L2 토큰: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- 연결 상태: ✅ 설정 완료

---

## 사용 방법

### L1 → L2 (입금)

1. Monad에서 IDGAF 토큰을 L1 브리지에 입금:
   ```solidity
   // IDGAFBridge 컨트랙트 주소: 0x006a5044781F97475390F33E3E1c903e393fcc3d
   bridge.deposit(amount);
   ```

2. 릴레이어가 L2 브리지에서 입금 처리:
   ```solidity
   // IDGAFChainBridge 컨트랙트 주소: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   l2Bridge.processDeposit(user, amount, depositId);
   ```

### L2 → L1 (출금)

1. L2에서 출금 요청:
   ```solidity
   l2Bridge.initiateWithdrawal(amount);
   ```

2. 릴레이어가 L1 브리지에서 출금 처리:
   ```solidity
   // IDGAFBridge 컨트랙트 주소: 0x006a5044781F97475390F33E3E1c903e393fcc3d
   l1Bridge.withdraw(user, amount, withdrawalId);
   ```

---

## 다음 단계

### 프로덕션 배포를 위해:

1. **IDGAF Chain 메인넷 구축**
   - 실제 L2 노드 인프라 구축
   - 공용 RPC 엔드포인트 설정
   - 블록 탐색기 연동

2. **릴레이어 서비스 구축**
   - L1과 L2 간 이벤트 모니터링
   - 자동 입출금 처리 시스템
   - 보안 감사

3. **프론트엔드 개발**
   - 브리지 UI/UX
   - 지갑 연결
   - 트랜잭션 모니터링

---

## 보안 참고사항

- ✅ 모든 컨트랙트는 재진입 공격 방지 적용
- ✅ 접근 제어 (Ownable) 구현
- ✅ 일시 중지 기능 (Pausable) 구현
- ⚠️ 프로덕션 배포 전 보안 감사 필수
- ⚠️ 브리지 오퍼레이터는 신뢰할 수 있는 주소로만 설정

---

## 배포 파일 위치

- L1 배포 정보: `deployments/monad-l1.json`
- L2 배포 정보: `deployments/hardhat-l2.json`

