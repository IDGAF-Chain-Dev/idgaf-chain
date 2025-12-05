# 다음 단계 가이드

IDGAF Chain 브리지 시스템이 완성되었습니다! 다음 단계를 진행하세요.

## ✅ 완료된 작업

1. ✅ 스마트 컨트랙트 개발 및 배포
   - L1 브리지 (Monad)
   - L2 브리지 (IDGAF Chain)
   - L2 토큰 컨트랙트

2. ✅ 릴레이어 서비스 구축
   - L1/L2 이벤트 모니터링
   - 자동 입출금 처리

3. ✅ 테스트 스크립트
   - 브리지 플로우 테스트
   - 오퍼레이터 설정 스크립트

4. ✅ 프론트엔드 기본 구조
   - 웹 인터페이스
   - 지갑 연결 기능

## 🚀 다음 단계

### 1. 릴레이어 서비스 실행

```bash
# 릴레이어 시작
npm run relayer

# 별도 터미널에서 L2 노드 실행 (로컬 테스트용)
npm run node:idgaf
```

### 2. L1 브리지 오퍼레이터 설정

릴레이어 계정을 L1 브리지의 오퍼레이터로 설정:

```bash
npx hardhat run scripts/setup-operator.ts --network monad
```

### 3. 브리지 테스트

```bash
# 브리지 플로우 테스트
npx hardhat run scripts/test-bridge-flow.ts --network hardhat
```

### 4. 프론트엔드 개발

`frontend/index.html`을 열어 기본 UI를 확인하고, 실제 컨트랙트와 통합:

- ethers.js 또는 web3.js 추가
- 컨트랙트 ABI 및 주소 설정
- 실제 트랜잭션 처리 로직 구현

### 5. IDGAF Chain 메인넷 구축

프로덕션 환경을 위해:

1. **L2 노드 인프라**
   - Geth, Erigon 등 EVM 호환 노드 실행
   - 공용 RPC 엔드포인트 제공
   - 블록 탐색기 연동

2. **릴레이어 인프라**
   - 고가용성 설정 (여러 인스턴스)
   - 모니터링 및 알림 시스템
   - 로그 수집 및 분석

3. **보안 감사**
   - 스마트 컨트랙트 감사
   - 릴레이어 보안 검증
   - 침투 테스트

## 📋 체크리스트

### 개발 환경
- [x] 스마트 컨트랙트 배포
- [x] 릴레이어 서비스 구축
- [x] 테스트 스크립트 작성
- [x] 프론트엔드 기본 구조

### 프로덕션 준비
- [ ] IDGAF Chain 메인넷 노드 구축
- [ ] 공용 RPC 엔드포인트 설정
- [ ] 블록 탐색기 연동
- [ ] 릴레이어 프로덕션 배포
- [ ] 모니터링 시스템 구축
- [ ] 보안 감사 완료
- [ ] 프론트엔드 완성 및 배포
- [ ] 문서화 완료

## 🔧 유용한 명령어

```bash
# 컴파일
npm run compile

# 테스트
npm test

# L1 배포
npm run deploy:l1

# L2 배포
npm run deploy:l2

# 릴레이어 실행
npm run relayer

# L2 노드 실행 (로컬)
npm run node:idgaf
```

## 📚 문서

- [README.md](./README.md) - 프로젝트 개요
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - 배포 요약
- [relayer/README.md](./relayer/README.md) - 릴레이어 가이드
- [frontend/README.md](./frontend/README.md) - 프론트엔드 가이드

## 🆘 문제 해결

### 릴레이어가 이벤트를 감지하지 못함
- RPC URL이 올바른지 확인
- 네트워크 연결 상태 확인
- 컨트랙트 주소가 올바른지 확인

### 트랜잭션 실패
- 가스비가 충분한지 확인
- 권한이 올바르게 설정되었는지 확인 (오퍼레이터, 소유자)
- 네트워크가 올바른지 확인

### 연결 오류
- `.env` 파일 설정 확인
- RPC 엔드포인트가 작동하는지 확인
- 방화벽 설정 확인

## 💡 추가 기능 아이디어

1. **다중 서명 지원**
   - 브리지 오퍼레이터 다중 서명
   - 거버넌스 시스템

2. **수수료 시스템**
   - 브리지 사용 수수료
   - 릴레이어 인센티브

3. **고급 모니터링**
   - 대시보드
   - 알림 시스템
   - 통계 및 분석

4. **모바일 앱**
   - React Native 또는 Flutter
   - 모바일 지갑 통합

