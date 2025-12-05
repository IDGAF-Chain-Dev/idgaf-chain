# IDGAF Bridge Frontend

IDGAF Bridge를 사용하기 위한 웹 인터페이스입니다.

## 두 가지 버전

### 1. Simple Version (권장)
- **파일**: `index-simple.html`
- **설명**: CDN을 통해 ethers.js v5를 로드하는 단일 HTML 파일
- **사용법**: 브라우저에서 직접 열기
- **장점**: 설정 불필요, 즉시 사용 가능

### 2. Module Version
- **파일**: `index.html` + `app.js`
- **설명**: Vite를 사용한 모듈화된 버전
- **사용법**: `npm install && npm run dev`
- **장점**: 개발 환경에서 더 나은 경험

## 빠른 시작 (Simple Version)

1. `index-simple.html` 파일을 브라우저에서 열기
2. MetaMask 지갑 연결
3. 브리지 방향 선택 (Monad ↔ IDGAF)
4. 금액 입력 후 브리지 실행

## 기능

- ✅ MetaMask 지갑 연결
- ✅ 네트워크 자동 전환
- ✅ 토큰 잔액 표시
- ✅ 실제 스마트 컨트랙트 호출
- ✅ 트랜잭션 상태 추적
- ✅ 양방향 브리징 (L1 ↔ L2)

## 개발 (Module Version)

```bash
# 의존성 설치
cd frontend
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build
```

## 컨트랙트 주소

컨트랙트 주소는 `app-simple.js` 또는 `app.js`에서 설정됩니다:

```javascript
const CONTRACTS = {
  l1: {
    bridge: '0x006a5044781F97475390F33E3E1c903e393fcc3d',
    token: '0x87deEb3696Ec069d5460C389cc78925df50d7777'
  },
  l2: {
    bridge: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    token: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  }
};
```

## 사용 방법

### L1 → L2 (입금)

1. "Monad → IDGAF" 선택
2. 금액 입력
3. "브리지 실행" 클릭
4. MetaMask에서 트랜잭션 승인
5. 릴레이어가 L2에서 처리할 때까지 대기

### L2 → L1 (출금)

1. "IDGAF → Monad" 선택
2. 금액 입력
3. "브리지 실행" 클릭
4. MetaMask에서 트랜잭션 승인
5. 릴레이어가 L1에서 처리할 때까지 대기

## 문제 해결

### "MetaMask가 설치되지 않았습니다"
- MetaMask 브라우저 확장 프로그램 설치 필요

### "네트워크를 찾을 수 없습니다"
- 네트워크가 자동으로 추가됩니다
- 수동으로 추가하려면 MetaMask 설정에서 네트워크 추가

### "트랜잭션 실패"
- 가스비가 충분한지 확인
- 네트워크가 올바른지 확인
- 토큰 잔액이 충분한지 확인

## 배포

정적 파일 호스팅 서비스에 배포:

- **Vercel**: `vercel deploy`
- **Netlify**: 드래그 앤 드롭
- **GitHub Pages**: `gh-pages` 브랜치에 푸시

## 보안 참고사항

- 프론트엔드는 클라이언트 사이드에서 실행됩니다
- 개인키는 절대 프론트엔드에 저장하지 마세요
- 항상 MetaMask와 같은 지갑을 사용하세요
- 프로덕션 배포 전 코드 감사 권장
