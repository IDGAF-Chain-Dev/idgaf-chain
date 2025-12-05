# GitHub Personal Access Token 생성하기

## Step 1: GitHub 설정 페이지 접속

1. https://github.com 접속
2. 로그인
3. 우측 상단 프로필 클릭 → **Settings**

## Step 2: Developer settings

1. 좌측 하단 **"Developer settings"** 클릭
2. 또는 직접 접속: https://github.com/settings/tokens

## Step 3: 토큰 생성

1. **"Personal access tokens"** → **"Tokens (classic)"** 클릭
2. **"Generate new token"** → **"Generate new token (classic)"** 클릭
3. **Note** 입력: `IDGAF Chain Deployment` (또는 원하는 이름)
4. **Expiration** 선택: `90 days` 또는 `No expiration` (선택)
5. **Scopes** 선택:
   - ✅ **repo** (전체 체크)
     - repo:status
     - repo_deployment
     - public_repo
     - repo:invite
     - security_events
6. 하단 **"Generate token"** 버튼 클릭

## Step 4: 토큰 복사

⚠️ **중요**: 토큰은 한 번만 보여줍니다!

1. 생성된 토큰 복사 (예: `ghp_xxxxxxxxxxxxxxxxxxxx`)
2. 안전한 곳에 저장

## Step 5: 토큰 사용

토큰을 받으면 다음 명령어로 Dockerfile을 업로드할 수 있습니다:

```bash
node cloud-deploy/upload-dockerfile.js YOUR_TOKEN
```

또는:

```bash
node cloud-deploy/upload-dockerfile.js YOUR_TOKEN IDGAF-Chain-Dev idgaf-chain
```

## 보안 주의사항

- ✅ 토큰을 코드에 하드코딩하지 마세요
- ✅ 공개 저장소에 커밋하지 마세요
- ✅ 토큰이 유출되면 즉시 삭제하세요
- ✅ 사용 후 필요없으면 삭제하세요

## 토큰 삭제

토큰을 삭제하려면:
1. https://github.com/settings/tokens 접속
2. 해당 토큰 옆 **"Delete"** 클릭

