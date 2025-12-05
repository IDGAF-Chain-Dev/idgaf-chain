# IDGAF Bridge Relayer

L1 (Monad)과 L2 (IDGAF Chain) 간 이벤트를 모니터링하고 자동으로 입출금을 처리하는 릴레이어 서비스입니다.

## 기능

- **L1 Deposit 모니터링**: Monad에서 IDGAF 토큰 입금 이벤트 감지
- **L2 Withdrawal 모니터링**: IDGAF Chain에서 출금 요청 이벤트 감지
- **자동 처리**: 감지된 이벤트를 자동으로 반대편 체인에서 처리

## 사전 요구사항

1. `.env` 파일에 다음 변수가 설정되어 있어야 합니다:
   ```env
   PRIVATE_KEY=your_private_key_here
   MONAD_RPC_URL=https://rpc1.monad.xyz
   IDGAF_RPC_URL=http://localhost:8546
   ```

2. L1 브리지 오퍼레이터 권한:
   - 릴레이어 계정이 L1 브리지의 오퍼레이터로 설정되어 있어야 합니다
   - 설정 방법: `npx hardhat run scripts/setup-operator.ts --network monad`

3. L2 브리지 소유자 권한:
   - 릴레이어 계정이 L2 브리지의 소유자여야 합니다
   - 또는 소유자가 릴레이어 계정에 권한을 부여해야 합니다

## 실행 방법

```bash
# 릴레이어 시작
npm run relayer

# 또는 직접 실행
ts-node relayer/index.ts
```

## 작동 방식

### L1 → L2 입금 플로우

1. 사용자가 Monad에서 IDGAF 토큰을 L1 브리지에 입금
2. 릴레이어가 `Deposit` 이벤트 감지
3. 릴레이어가 L2 브리지에서 `processDeposit()` 호출
4. L2 토큰이 사용자에게 민팅됨

### L2 → L1 출금 플로우

1. 사용자가 IDGAF Chain에서 출금 요청
2. 릴레이어가 `WithdrawalInitiated` 이벤트 감지
3. 릴레이어가 L1 브리지에서 `withdraw()` 호출
4. L1 IDGAF 토큰이 사용자에게 전송됨

## 로그 예시

```
🚀 Starting IDGAF Bridge Relayer...
L1 Bridge: 0x006a5044781F97475390F33E3E1c903e393fcc3d
L2 Bridge: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
📡 Monitoring L1 Deposit events...
📡 Monitoring L2 Withdrawal events...
✅ Relayer is running. Monitoring events...

🔔 New L1 Deposit detected:
  User: 0x...
  Amount: 100.0 IDGAF
  Deposit ID: 0x...
🔄 Processing L1 deposit on L2...
  Transaction sent: 0x...
  ✅ Deposit processed successfully!
```

## 문제 해결

### "Signer is not a bridge operator"
- L1 브리지에 오퍼레이터로 등록되지 않았습니다
- `scripts/setup-operator.ts`를 실행하여 설정하세요

### "Signer is not the bridge owner"
- L2 브리지의 소유자가 아닙니다
- 배포 계정으로 릴레이어를 실행하거나, 소유자에게 권한을 요청하세요

### 연결 오류
- RPC URL이 올바른지 확인하세요
- 네트워크 연결 상태를 확인하세요
- L2 노드가 실행 중인지 확인하세요

## 프로덕션 배포 시 고려사항

1. **고가용성**: 여러 릴레이어 인스턴스를 실행하여 단일 장애점 방지
2. **모니터링**: 로그 및 메트릭 수집 시스템 구축
3. **알림**: 오류 발생 시 알림 시스템 구축
4. **보안**: 개인키는 안전하게 관리 (하드웨어 지갑, AWS Secrets Manager 등)
5. **백업**: 트랜잭션 실패 시 재시도 메커니즘 구현

